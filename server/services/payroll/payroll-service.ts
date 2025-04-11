/**
 * PaySurity Payroll Service
 * 
 * This service provides comprehensive payroll management including employee management,
 * payroll processing, tax calculations, and reporting.
 */

import { db } from '../../db';
import { eq, and, lte, gte, desc, or, isNull } from 'drizzle-orm';
import { Decimal } from 'decimal.js';
import {
  employees,
  payrollRuns,
  payrollEntries,
  employeeBenefits,
  employeeDocuments,
  employeeLeaveBalances,
  Employee,
  PayrollRun,
  PayrollEntry,
  EmployeeBenefit,
  EmployeeDocument,
  EmployeeLeaveBalance
} from '@shared/schema-employees';
import { taxCalculationService } from './tax-calculation-service';

/**
 * Payroll Service class
 */
export class PayrollService {
  /**
   * Get all employees for a merchant
   */
  async getEmployees(merchantId: number): Promise<Employee[]> {
    return db.select().from(employees).where(eq(employees.merchantId, merchantId));
  }

  /**
   * Get an employee by ID
   */
  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  /**
   * Create a new employee
   */
  async createEmployee(employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    const [employee] = await db.insert(employees).values(employeeData).returning();
    return employee;
  }

  /**
   * Update an employee
   */
  async updateEmployee(id: number, employeeData: Partial<Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Employee> {
    const [employee] = await db
      .update(employees)
      .set({ ...employeeData, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return employee;
  }

  /**
   * Delete an employee (mark as inactive)
   */
  async deleteEmployee(id: number): Promise<boolean> {
    await db
      .update(employees)
      .set({ status: 'terminated', updatedAt: new Date() })
      .where(eq(employees.id, id));
    return true;
  }

  /**
   * Get all payroll runs for a merchant
   */
  async getPayrollRuns(merchantId: number): Promise<PayrollRun[]> {
    return db
      .select()
      .from(payrollRuns)
      .where(eq(payrollRuns.merchantId, merchantId))
      .orderBy(desc(payrollRuns.payDate));
  }

  /**
   * Get a payroll run by ID
   */
  async getPayrollRun(id: number): Promise<PayrollRun | undefined> {
    const [run] = await db.select().from(payrollRuns).where(eq(payrollRuns.id, id));
    return run;
  }

  /**
   * Create a new payroll run
   */
  async createPayrollRun(runData: Omit<PayrollRun, 'id' | 'createdAt' | 'updatedAt'>): Promise<PayrollRun> {
    const [run] = await db.insert(payrollRuns).values(runData).returning();
    return run;
  }

  /**
   * Update a payroll run
   */
  async updatePayrollRun(id: number, runData: Partial<Omit<PayrollRun, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PayrollRun> {
    const [run] = await db
      .update(payrollRuns)
      .set({ ...runData, updatedAt: new Date() })
      .where(eq(payrollRuns.id, id))
      .returning();
    return run;
  }

  /**
   * Delete a payroll run
   */
  async deletePayrollRun(id: number): Promise<boolean> {
    await db
      .update(payrollRuns)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(payrollRuns.id, id));
    return true;
  }

  /**
   * Get all payroll entries for a payroll run
   */
  async getPayrollEntries(payrollRunId: number): Promise<PayrollEntry[]> {
    return db.select().from(payrollEntries).where(eq(payrollEntries.payrollRunId, payrollRunId));
  }

  /**
   * Get a payroll entry by ID
   */
  async getPayrollEntry(id: number): Promise<PayrollEntry | undefined> {
    const [entry] = await db.select().from(payrollEntries).where(eq(payrollEntries.id, id));
    return entry;
  }

  /**
   * Create a new payroll entry
   */
  async createPayrollEntry(entryData: Omit<PayrollEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<PayrollEntry> {
    const [entry] = await db.insert(payrollEntries).values(entryData).returning();
    return entry;
  }

  /**
   * Update a payroll entry
   */
  async updatePayrollEntry(id: number, entryData: Partial<Omit<PayrollEntry, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PayrollEntry> {
    const [entry] = await db
      .update(payrollEntries)
      .set({ ...entryData, updatedAt: new Date() })
      .where(eq(payrollEntries.id, id))
      .returning();
    return entry;
  }

  /**
   * Calculate taxes for a payroll entry
   */
  async calculatePayrollEntryTaxes(payrollEntryId: number): Promise<PayrollEntry> {
    // Get the payroll entry
    const entry = await this.getPayrollEntry(payrollEntryId);
    if (!entry) {
      throw new Error(`Payroll entry with ID ${payrollEntryId} not found`);
    }

    // Get the payroll run
    const run = await this.getPayrollRun(entry.payrollRunId);
    if (!run) {
      throw new Error(`Payroll run with ID ${entry.payrollRunId} not found`);
    }

    // Calculate taxes using tax calculation service
    const taxCalculations = await taxCalculationService.calculateEmployeeTaxes(
      entry.employeeId,
      entry.payrollRunId,
      entry.grossPay,
      run.payrollPeriodStart,
      run.payrollPeriodEnd
    );

    // Sum up all tax amounts
    const totalTaxes = taxCalculations.reduce(
      (sum, calc) => sum.plus(calc.taxAmount),
      new Decimal(0)
    );

    // Update the payroll entry with tax information
    const updatedEntry = await this.updatePayrollEntry(entry.id, {
      totalTaxes: totalTaxes.toString(),
      netPay: new Decimal(entry.grossPay).minus(totalTaxes).toString(),
      taxes: taxCalculations.map(calc => ({
        taxType: calc.taxType,
        jurisdictionId: calc.jurisdictionId,
        amount: calc.taxAmount,
        ytdAmount: calc.ytdTaxWithheld
      }))
    });

    return updatedEntry;
  }

  /**
   * Process a payroll run - calculate taxes and update all entries
   */
  async processPayrollRun(payrollRunId: number): Promise<PayrollRun> {
    // Get the payroll run
    const run = await this.getPayrollRun(payrollRunId);
    if (!run) {
      throw new Error(`Payroll run with ID ${payrollRunId} not found`);
    }

    // Update payroll run status to processing
    await this.updatePayrollRun(payrollRunId, { status: 'processing' });

    try {
      // Get all entries for this payroll run
      const entries = await this.getPayrollEntries(payrollRunId);

      // Calculate taxes for each entry
      let totalGrossPay = new Decimal(0);
      let totalNetPay = new Decimal(0);
      let totalTaxes = new Decimal(0);
      let totalDeductions = new Decimal(0);

      for (const entry of entries) {
        const updatedEntry = await this.calculatePayrollEntryTaxes(entry.id);
        
        totalGrossPay = totalGrossPay.plus(updatedEntry.grossPay);
        totalNetPay = totalNetPay.plus(updatedEntry.netPay || 0);
        totalTaxes = totalTaxes.plus(updatedEntry.totalTaxes || 0);
        totalDeductions = totalDeductions.plus(updatedEntry.totalDeductions || 0);
      }

      // Update the payroll run with totals
      const updatedRun = await this.updatePayrollRun(payrollRunId, {
        status: 'completed',
        totalGrossPay: totalGrossPay.toString(),
        totalNetPay: totalNetPay.toString(),
        totalTaxes: totalTaxes.toString(),
        totalDeductions: totalDeductions.toString(),
        processedAt: new Date()
      });

      return updatedRun;
    } catch (error) {
      // If processing fails, update the status
      await this.updatePayrollRun(payrollRunId, { 
        status: 'error',
        notes: `Error processing payroll: ${error.message}`
      });
      throw error;
    }
  }

  /**
   * Generate a new payroll run for a given period
   */
  async generatePayrollRun(
    merchantId: number,
    payrollPeriodStart: Date,
    payrollPeriodEnd: Date,
    payDate: Date,
    payFrequency: string,
    createdBy: number
  ): Promise<PayrollRun> {
    // Create the payroll run
    const payrollRun = await this.createPayrollRun({
      merchantId,
      payrollPeriodStart,
      payrollPeriodEnd,
      payDate,
      payFrequency: payFrequency as any,
      status: 'draft',
      createdBy
    });

    // Get all active employees
    const activeEmployees = await db
      .select()
      .from(employees)
      .where(
        and(
          eq(employees.merchantId, merchantId),
          eq(employees.status, 'active')
        )
      );

    // Create payroll entries for each employee
    for (const employee of activeEmployees) {
      // Calculate hours and pay based on employee type
      let regularHours = new Decimal(0);
      let grossPay = new Decimal(0);

      if (employee.payType === 'hourly') {
        // For hourly employees, use standard hours
        regularHours = new Decimal(employee.standardHours || 0);
        grossPay = regularHours.times(new Decimal(employee.payRate || 0));
      } else if (employee.payType === 'salary') {
        // For salaried employees, calculate based on pay frequency
        // This is a simplified calculation and would be more complex in a real system
        let payPeriods = 0;
        switch (payFrequency) {
          case 'weekly':
            payPeriods = 52;
            break;
          case 'biweekly':
            payPeriods = 26;
            break;
          case 'semimonthly':
            payPeriods = 24;
            break;
          case 'monthly':
            payPeriods = 12;
            break;
          default:
            payPeriods = 26; // Default to biweekly
        }
        
        // Calculate gross pay for this period
        grossPay = new Decimal(employee.payRate || 0).dividedBy(payPeriods);
      }

      // Create the payroll entry
      await this.createPayrollEntry({
        payrollRunId: payrollRun.id,
        employeeId: employee.id,
        regularHours: regularHours.toString(),
        regularRate: employee.payRate?.toString() || '0',
        grossPay: grossPay.toString(),
        status: 'pending'
      });
    }

    return payrollRun;
  }

  /**
   * Get employee benefits
   */
  async getEmployeeBenefits(employeeId: number): Promise<EmployeeBenefit[]> {
    return db
      .select()
      .from(employeeBenefits)
      .where(eq(employeeBenefits.employeeId, employeeId));
  }

  /**
   * Create employee benefit
   */
  async createEmployeeBenefit(benefitData: Omit<EmployeeBenefit, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmployeeBenefit> {
    const [benefit] = await db.insert(employeeBenefits).values(benefitData).returning();
    return benefit;
  }

  /**
   * Update employee benefit
   */
  async updateEmployeeBenefit(id: number, benefitData: Partial<Omit<EmployeeBenefit, 'id' | 'createdAt' | 'updatedAt'>>): Promise<EmployeeBenefit> {
    const [benefit] = await db
      .update(employeeBenefits)
      .set({ ...benefitData, updatedAt: new Date() })
      .where(eq(employeeBenefits.id, id))
      .returning();
    return benefit;
  }
}

// Export an instance of the service
export const payrollService = new PayrollService();