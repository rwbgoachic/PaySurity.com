/**
 * Payroll Processor Service
 * 
 * This service handles the processing of payroll including:
 * - Calculating gross pay from time entries
 * - Applying tax calculations via the TaxCalculationService
 * - Processing deductions and benefits
 * - Generating pay stubs and payroll reports
 * - Interfacing with accounting and payment systems
 */

import { db } from "../../db";
import { 
  payrollEntries, timeEntries, users, wallets,
  accountRequests, transactions,
  type User, type PayrollEntry, type TimeEntry,
  type InsertPayrollEntry
} from "@shared/schema";
import { eq, and, gte, lte, desc, between } from "drizzle-orm";
import { taxCalculationService } from "./tax-calculation-service";
import { Decimal } from "decimal.js";

/**
 * Main Payroll Processor Service Class
 */
export class PayrollProcessorService {

  /**
   * Process payroll for an employer for the specified period
   * 
   * @param employerId The ID of the employer
   * @param startDate The start date of the pay period
   * @param endDate The end date of the pay period
   * @param payDate The date employees will be paid
   * @param processedBy The ID of the user processing the payroll
   */
  async processPayroll(
    employerId: number,
    startDate: Date,
    endDate: Date,
    payDate: Date,
    processedBy: number
  ): Promise<{
    processedEntries: PayrollEntry[];
    errors: { userId: number; error: string }[];
  }> {
    // Get all employees for this employer
    const employees = await this.getEmployees(employerId);
    
    if (!employees.length) {
      throw new Error("No employees found for this employer");
    }
    
    const processedEntries: PayrollEntry[] = [];
    const errors: { userId: number; error: string }[] = [];
    
    // Get tax year (use the year of the end date)
    const taxYear = endDate.getFullYear();
    
    // Process each employee's payroll
    for (const employee of employees) {
      try {
        // Get time entries for this employee during the pay period
        const employeeTimeEntries = await this.getTimeEntries(employee.id, startDate, endDate);
        
        // Calculate gross pay based on time entries and employee rate
        const { 
          hoursWorked, 
          regularHours, 
          overtimeHours,
          regularPay,
          overtimePay,
          grossPay 
        } = await this.calculateGrossPay(employee.id, employeeTimeEntries);
        
        // Create payroll entry
        const payrollEntry: InsertPayrollEntry = {
          userId: employee.id,
          employerId,
          payPeriodStart: startDate,
          payPeriodEnd: endDate,
          payDate,
          hoursWorked: hoursWorked.toString(),
          regularRate: employee.hourlyRate?.toString() || "0",
          overtimeRate: employee.overtimeRate?.toString() || "0",
          regularPay: regularPay.toString(),
          overtimePay: overtimePay.toString(),
          bonusPay: "0", // No bonus pay by default
          commissionPay: "0", // No commission pay by default
          grossPay: grossPay.toString(),
          federalTax: "0", // Will be calculated by tax service
          stateTax: "0", // Will be calculated by tax service
          socialSecurity: "0", // Will be calculated by tax service
          medicare: "0", // Will be calculated by tax service
          netPay: "0", // Will be calculated after taxes
          compensationType: employee.compensationType || "w2",
          payPeriod: "biweekly", // Default to biweekly
          status: "pending",
          notes: `Payroll processed on ${new Date().toISOString()} for period ${startDate.toDateString()} to ${endDate.toDateString()}`
        };
        
        // Save the payroll entry
        const [savedEntry] = await db.insert(payrollEntries)
          .values(payrollEntry)
          .returning();
        
        // Calculate taxes using the tax calculation service
        await taxCalculationService.calculateTaxes(
          savedEntry.id,
          employee.id,
          grossPay,
          taxYear,
          processedBy
        );
        
        // Reload the payroll entry with calculated taxes
        const [updatedEntry] = await db.select()
          .from(payrollEntries)
          .where(eq(payrollEntries.id, savedEntry.id));
        
        if (updatedEntry) {
          // Mark the payroll entry as processed
          const [finalEntry] = await db.update(payrollEntries)
            .set({ status: "completed", processedAt: new Date() })
            .where(eq(payrollEntries.id, updatedEntry.id))
            .returning();
          
          processedEntries.push(finalEntry);
          
          // Process direct deposits if enabled
          if (employee.directDepositEnabled) {
            await this.processDirectDeposit(finalEntry);
          }
        }
      } catch (error) {
        console.error(`Error processing payroll for employee ${employee.id}:`, error);
        errors.push({ 
          userId: employee.id, 
          error: (error instanceof Error) ? error.message : 'Unknown error'
        });
      }
    }
    
    return { processedEntries, errors };
  }
  
  /**
   * Get all employees for an employer
   */
  private async getEmployees(employerId: number): Promise<Array<User & { hourlyRate?: string, overtimeRate?: string, compensationType?: string, directDepositEnabled?: boolean }>> {
    // In a real system, this would query employee-specific data
    // Here we're using the users table with some assumptions
    const employees = await db.select()
      .from(users)
      .where(eq(users.organizationId, employerId));
    
    // In a production system, we would join with employee_profiles table
    // For this demo, we'll add some mock hourly rates
    return employees.map(employee => ({
      ...employee,
      hourlyRate: "25.00", // Default hourly rate
      overtimeRate: "37.50", // 1.5x regular rate
      compensationType: "w2", // Default to W-2 employee
      directDepositEnabled: true // Default to direct deposit
    }));
  }
  
  /**
   * Get time entries for an employee during a specific period
   */
  private async getTimeEntries(userId: number, startDate: Date, endDate: Date): Promise<TimeEntry[]> {
    return db.select()
      .from(timeEntries)
      .where(
        and(
          eq(timeEntries.userId, userId),
          gte(timeEntries.date, startDate),
          lte(timeEntries.date, endDate),
          eq(timeEntries.status, "approved")
        )
      );
  }
  
  /**
   * Calculate gross pay based on time entries and rates
   */
  private async calculateGrossPay(
    userId: number, 
    timeEntries: TimeEntry[]
  ): Promise<{
    hoursWorked: Decimal;
    regularHours: Decimal;
    overtimeHours: Decimal;
    regularPay: Decimal;
    overtimePay: Decimal;
    grossPay: Decimal;
  }> {
    // Get employee rate information
    // In a real system, this would come from an employee_profiles table
    const hourlyRate = new Decimal("25.00"); // Default hourly rate
    const overtimeRate = new Decimal("37.50"); // 1.5x regular rate
    const overtimeThreshold = new Decimal("40"); // Hours per week threshold for overtime
    
    // Initialize counters
    let totalHoursWorked = new Decimal(0);
    let regularHours = new Decimal(0);
    let overtimeHours = new Decimal(0);
    
    // Group time entries by week to calculate overtime properly
    const weeklyHours: Record<string, Decimal> = {};
    
    for (const entry of timeEntries) {
      // Calculate week number for grouping
      const entryDate = new Date(entry.date);
      const weekStart = new Date(entryDate);
      weekStart.setDate(entryDate.getDate() - entryDate.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      // Add hours to weekly total
      const entryHours = new Decimal(entry.hoursWorked || 0);
      weeklyHours[weekKey] = (weeklyHours[weekKey] || new Decimal(0)).plus(entryHours);
      totalHoursWorked = totalHoursWorked.plus(entryHours);
    }
    
    // Calculate regular and overtime hours by week
    for (const [_, weekHours] of Object.entries(weeklyHours)) {
      if (weekHours.greaterThan(overtimeThreshold)) {
        // This week has overtime
        regularHours = regularHours.plus(overtimeThreshold);
        overtimeHours = overtimeHours.plus(weekHours.minus(overtimeThreshold));
      } else {
        // No overtime this week
        regularHours = regularHours.plus(weekHours);
      }
    }
    
    // Calculate pay
    const regularPay = regularHours.times(hourlyRate);
    const overtimePay = overtimeHours.times(overtimeRate);
    const grossPay = regularPay.plus(overtimePay);
    
    return {
      hoursWorked: totalHoursWorked,
      regularHours,
      overtimeHours,
      regularPay,
      overtimePay,
      grossPay
    };
  }
  
  /**
   * Process direct deposit for a payroll entry
   */
  private async processDirectDeposit(payrollEntry: PayrollEntry): Promise<boolean> {
    try {
      // Get employee's main wallet
      const [employeeWallet] = await db.select()
        .from(wallets)
        .where(
          and(
            eq(wallets.userId, payrollEntry.userId),
            eq(wallets.isMain, true)
          )
        );
      
      if (!employeeWallet) {
        throw new Error(`No main wallet found for employee ${payrollEntry.userId}`);
      }
      
      // Create a transaction for the direct deposit
      const netPay = new Decimal(payrollEntry.netPay);
      
      await db.insert(transactions)
        .values({
          walletId: employeeWallet.id,
          userId: payrollEntry.userId,
          amount: netPay.toString(),
          type: "incoming",
          method: "ach",
          merchantName: `${payrollEntry.employerId} Payroll`,
          expenseType: "salary",
          date: new Date(payrollEntry.payDate),
          createdAt: new Date()
        });
      
      // Update the wallet balance
      const currentBalance = new Decimal(employeeWallet.balance || 0);
      const newBalance = currentBalance.plus(netPay);
      
      await db.update(wallets)
        .set({ balance: newBalance.toString() })
        .where(eq(wallets.id, employeeWallet.id));
      
      return true;
    } catch (error) {
      console.error("Error processing direct deposit:", error);
      return false;
    }
  }
  
  /**
   * Generate a pay stub for a specific payroll entry
   */
  async generatePayStub(payrollEntryId: number): Promise<any> {
    // Get payroll entry with detailed information
    const [payrollEntry] = await db.select()
      .from(payrollEntries)
      .where(eq(payrollEntries.id, payrollEntryId));
    
    if (!payrollEntry) {
      throw new Error(`Payroll entry ${payrollEntryId} not found`);
    }
    
    // Get employee information
    const [employee] = await db.select()
      .from(users)
      .where(eq(users.id, payrollEntry.userId));
    
    if (!employee) {
      throw new Error(`Employee ${payrollEntry.userId} not found`);
    }
    
    // Get employer information
    const [employer] = await db.select()
      .from(users)
      .where(eq(users.id, payrollEntry.employerId));
    
    if (!employer) {
      throw new Error(`Employer ${payrollEntry.employerId} not found`);
    }
    
    // Get tax calculation details
    const [taxCalculation] = await db.select()
      .from(taxCalculations)
      .where(eq(taxCalculations.payrollEntryId, payrollEntryId));
    
    // Format pay stub data
    const payStub = {
      payrollId: payrollEntry.id,
      payPeriod: {
        start: payrollEntry.payPeriodStart,
        end: payrollEntry.payPeriodEnd,
        payDate: payrollEntry.payDate
      },
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        address: employee.address,
        ssn: employee.ssn ? `XXX-XX-${employee.ssn.slice(-4)}` : undefined
      },
      employer: {
        id: employer.id,
        name: `${employer.firstName} ${employer.lastName}`,
        address: employer.address
      },
      earnings: {
        regularHours: parseFloat(payrollEntry.hoursWorked),
        regularRate: parseFloat(payrollEntry.regularRate),
        regularPay: parseFloat(payrollEntry.regularPay),
        overtimePay: parseFloat(payrollEntry.overtimePay),
        bonusPay: parseFloat(payrollEntry.bonusPay),
        commissionPay: parseFloat(payrollEntry.commissionPay),
        grossPay: parseFloat(payrollEntry.grossPay)
      },
      deductions: {
        federalTax: parseFloat(payrollEntry.federalTax),
        stateTax: parseFloat(payrollEntry.stateTax),
        socialSecurity: parseFloat(payrollEntry.socialSecurity),
        medicare: parseFloat(payrollEntry.medicare),
        otherDeductions: 0, // Add other deductions if needed
        totalDeductions: parseFloat(payrollEntry.grossPay) - parseFloat(payrollEntry.netPay)
      },
      yearToDate: taxCalculation ? {
        grossEarnings: parseFloat(taxCalculation.ytdGrossEarnings),
        federalTax: parseFloat(taxCalculation.ytdFederalWithholding),
        stateTax: parseFloat(taxCalculation.ytdStateWithholding),
        socialSecurity: parseFloat(taxCalculation.ytdSocialSecurityWithholding),
        medicare: parseFloat(taxCalculation.ytdMedicareWithholding)
      } : undefined,
      netPay: parseFloat(payrollEntry.netPay)
    };
    
    return payStub;
  }
  
  /**
   * Generate a payroll report for an employer for a specific period
   */
  async generatePayrollReport(
    employerId: number,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // Get all payroll entries for this employer during the specified period
    const payrollEntries = await db.select()
      .from(payrollEntries)
      .where(
        and(
          eq(payrollEntries.employerId, employerId),
          gte(payrollEntries.payDate, startDate),
          lte(payrollEntries.payDate, endDate),
          eq(payrollEntries.status, "completed")
        )
      );
    
    if (!payrollEntries.length) {
      return {
        employerId,
        period: { startDate, endDate },
        summary: {
          totalEmployees: 0,
          totalGrossPay: 0,
          totalTaxes: 0,
          totalNetPay: 0
        },
        entries: []
      };
    }
    
    // Get all employee IDs
    const employeeIds = [...new Set(payrollEntries.map(entry => entry.userId))];
    
    // Get employee names
    const employees = await db.select()
      .from(users)
      .where(eq(users.id, employeeIds));
    
    // Create employee map for quick lookup
    const employeeMap = new Map(employees.map(emp => [emp.id, emp]));
    
    // Calculate totals
    let totalGrossPay = new Decimal(0);
    let totalTaxes = new Decimal(0);
    let totalNetPay = new Decimal(0);
    
    // Format payroll entries
    const formattedEntries = payrollEntries.map(entry => {
      const employee = employeeMap.get(entry.userId);
      const grossPay = new Decimal(entry.grossPay);
      const netPay = new Decimal(entry.netPay);
      const taxes = new Decimal(entry.federalTax)
        .plus(entry.stateTax)
        .plus(entry.socialSecurity)
        .plus(entry.medicare);
      
      // Update totals
      totalGrossPay = totalGrossPay.plus(grossPay);
      totalTaxes = totalTaxes.plus(taxes);
      totalNetPay = totalNetPay.plus(netPay);
      
      return {
        payrollId: entry.id,
        employeeId: entry.userId,
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : `Employee ${entry.userId}`,
        payDate: entry.payDate,
        payPeriod: {
          start: entry.payPeriodStart,
          end: entry.payPeriodEnd
        },
        hoursWorked: parseFloat(entry.hoursWorked),
        grossPay: parseFloat(entry.grossPay),
        taxes: {
          federal: parseFloat(entry.federalTax),
          state: parseFloat(entry.stateTax),
          socialSecurity: parseFloat(entry.socialSecurity),
          medicare: parseFloat(entry.medicare),
          total: taxes.toNumber()
        },
        netPay: parseFloat(entry.netPay)
      };
    });
    
    // Create the payroll report
    const report = {
      employerId,
      period: { startDate, endDate },
      summary: {
        totalEmployees: employeeIds.length,
        totalGrossPay: totalGrossPay.toNumber(),
        totalTaxes: totalTaxes.toNumber(),
        totalNetPay: totalNetPay.toNumber()
      },
      entries: formattedEntries
    };
    
    return report;
  }
}

export const payrollProcessorService = new PayrollProcessorService();