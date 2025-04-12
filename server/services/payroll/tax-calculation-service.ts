/**
 * Tax Calculation Service
 * 
 * This service handles all payroll tax calculations including federal, state, and local taxes.
 * It implements various tax calculation methods and manages employee tax elections.
 */

import { db } from '../../db';
import { eq, and, lte, gte, desc, isNull, asc, or } from 'drizzle-orm';
import { Decimal } from 'decimal.js';

// Import tables from schema files
import {
  employees,
  payrollRuns
} from '@shared/schema-employees';

import {
  taxJurisdictions,
  taxTables,
  taxBrackets,
  employeeTaxElections,
  payrollTaxCalculations,
  payrollTaxSettings,
  specialTaxSituations,
  taxUpdateLogs,
  taxTypeEnum,
  TaxJurisdiction,
  TaxTable,
  TaxBracket,
  EmployeeTaxElection,
  PayrollTaxCalculation,
  PayrollTaxSetting,
  SpecialTaxSituation
} from '@shared/schema-payroll';

// Decimal precision settings
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Tax Calculation Service class
 */
export class TaxCalculationService {
  /**
   * Calculate all payroll taxes for an employee
   */
  async calculateEmployeeTaxes(
    employeeId: number,
    payrollRunId: number,
    grossIncome: string | number,
    payPeriodStart: Date,
    payPeriodEnd: Date
  ): Promise<PayrollTaxCalculation[]> {
    try {
      // Get employee data
      const [employee] = await db.select().from(employees).where(eq(employees.id, employeeId));

      if (!employee) {
        throw new Error(`Employee with ID ${employeeId} not found`);
      }

      // Get payroll run data
      const [payrollRun] = await db.select().from(payrollRuns).where(eq(payrollRuns.id, payrollRunId));

      if (!payrollRun) {
        throw new Error(`Payroll run with ID ${payrollRunId} not found`);
      }

      // Get merchant's tax settings
      const [taxSettings] = await db.select().from(payrollTaxSettings).where(eq(payrollTaxSettings.merchantId, employee.merchantId));

      // Get employee's work location jurisdiction(s)
      const workJurisdictions = await this.getEmployeeJurisdictions(
        employeeId,
        payPeriodStart
      );

      // Get employee's tax elections for all applicable jurisdictions
      const taxElections = await db.select().from(employeeTaxElections).where(
        and(
          eq(employeeTaxElections.employeeId, employeeId),
          lte(employeeTaxElections.effectiveDate, payPeriodEnd),
          or(
            isNull(employeeTaxElections.expirationDate),
            gte(employeeTaxElections.expirationDate, payPeriodStart)
          )
        )
      );

      // Get YTD earnings to handle wage bases and caps
      const ytdEarnings = await this.getYTDEarnings(
        employeeId,
        payPeriodEnd
      );

      const decimalGrossIncome = new Decimal(grossIncome.toString());
      const taxCalculations: PayrollTaxCalculation[] = [];

      // Calculate each type of tax based on applicable jurisdictions
      for (const jurisdiction of workJurisdictions) {
        // Get applicable tax tables for this jurisdiction
        const taxTablesList = await db.select().from(taxTables).where(
          and(
            eq(taxTables.jurisdictionId, jurisdiction.id),
            eq(taxTables.isActive, true),
            lte(taxTables.effectiveDate, payPeriodEnd),
            or(
              isNull(taxTables.expirationDate),
              gte(taxTables.expirationDate, payPeriodStart)
            ),
            or(
              isNull(taxTables.payFrequency),
              eq(taxTables.payFrequency, payrollRun.payFrequency)
            )
          )
        );

        for (const taxTable of taxTablesList) {
          // Check if employee is exempt from this tax
          const exemption = taxElections.find(
            election => 
              election.jurisdictionId === jurisdiction.id && 
              election.taxType === taxTable.taxType && 
              election.exemption
          );

          if (exemption) {
            // Employee is exempt from this tax
            taxCalculations.push(
              await this.createExemptTaxCalculation(
                payrollRunId,
                employeeId,
                jurisdiction.id,
                taxTable.id,
                taxTable.taxType,
                decimalGrossIncome.toString()
              )
            );
            continue;
          }

          // Get tax election for this tax type if exists
          const taxElection = taxElections.find(
            election => 
              election.jurisdictionId === jurisdiction.id && 
              election.taxType === taxTable.taxType
          );

          // Get YTD withholding for this tax type
          const ytdWithholding = await this.getYTDWithholding(
            employeeId,
            jurisdiction.id,
            taxTable.taxType,
            payPeriodEnd
          );

          // Calculate tax based on calculation method
          let taxCalculation: PayrollTaxCalculation;
          
          switch (taxTable.calculationMethod) {
            case 'flat_rate':
              taxCalculation = await this.calculateFlatRateTax(
                payrollRunId,
                employeeId,
                jurisdiction,
                taxTable,
                decimalGrossIncome,
                taxElection,
                ytdEarnings,
                ytdWithholding
              );
              break;
              
            case 'progressive':
              taxCalculation = await this.calculateProgressiveTax(
                payrollRunId,
                employeeId,
                jurisdiction,
                taxTable,
                decimalGrossIncome,
                taxElection,
                ytdEarnings,
                ytdWithholding
              );
              break;
              
            case 'fixed_amount':
              taxCalculation = await this.calculateFixedAmountTax(
                payrollRunId,
                employeeId,
                jurisdiction,
                taxTable,
                decimalGrossIncome,
                taxElection,
                ytdEarnings,
                ytdWithholding
              );
              break;
              
            case 'percentage_with_cap':
              taxCalculation = await this.calculatePercentageWithCapTax(
                payrollRunId,
                employeeId,
                jurisdiction,
                taxTable,
                decimalGrossIncome,
                taxElection,
                ytdEarnings,
                ytdWithholding
              );
              break;
              
            case 'wage_base':
              taxCalculation = await this.calculateWageBaseTax(
                payrollRunId,
                employeeId,
                jurisdiction,
                taxTable,
                decimalGrossIncome,
                taxElection,
                ytdEarnings,
                ytdWithholding
              );
              break;
              
            default:
              throw new Error(`Unsupported tax calculation method: ${taxTable.calculationMethod}`);
          }
          
          taxCalculations.push(taxCalculation);
        }
      }

      // Handle special tax situations
      await this.processSpecialTaxSituations(
        employeeId,
        payrollRunId,
        taxCalculations,
        payPeriodStart,
        payPeriodEnd
      );

      return taxCalculations;
    } catch (error) {
      console.error('Error calculating employee taxes:', error);
      throw error;
    }
  }

  /**
   * Get all applicable jurisdictions for an employee
   */
  private async getEmployeeJurisdictions(
    employeeId: number,
    asOfDate: Date
  ): Promise<TaxJurisdiction[]> {
    // Get employee data including work location
    const [employee] = await db.select().from(employees).where(eq(employees.id, employeeId));

    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    // Always include Federal jurisdiction
    const [federalJurisdiction] = await db.select().from(taxJurisdictions).where(
      and(
        eq(taxJurisdictions.type, 'federal'),
        eq(taxJurisdictions.code, 'US'),
        eq(taxJurisdictions.isActive, true)
      )
    );

    if (!federalJurisdiction) {
      throw new Error('Federal tax jurisdiction not found');
    }

    const result: TaxJurisdiction[] = [federalJurisdiction];

    // Add state jurisdiction based on work state
    if (employee.workState) {
      const [stateJurisdiction] = await db.select().from(taxJurisdictions).where(
        and(
          eq(taxJurisdictions.type, 'state'),
          eq(taxJurisdictions.code, employee.workState),
          eq(taxJurisdictions.isActive, true)
        )
      );

      if (stateJurisdiction) {
        result.push(stateJurisdiction);

        // Add local jurisdictions if applicable
        if (employee.workCity || employee.workCounty) {
          const localJurisdictions = await db.select().from(taxJurisdictions).where(
            and(
              eq(taxJurisdictions.parentJurisdictionId, stateJurisdiction.id),
              eq(taxJurisdictions.isActive, true),
              or(
                employee.workCity ? eq(taxJurisdictions.name, employee.workCity) : undefined,
                employee.workCounty ? eq(taxJurisdictions.name, employee.workCounty) : undefined
              )
            )
          );

          result.push(...localJurisdictions);
        }
      }
    }

    return result;
  }

  /**
   * Get employee's YTD earnings
   */
  private async getYTDEarnings(
    employeeId: number,
    asOfDate: Date
  ): Promise<string> {
    // Get all payroll calculations for this employee in the current year
    const year = asOfDate.getFullYear();
    const startOfYear = new Date(year, 0, 1);

    const calculations = await db.select().from(payrollTaxCalculations).where(
      and(
        eq(payrollTaxCalculations.employeeId, employeeId),
        gte(payrollTaxCalculations.calculatedAt, startOfYear),
        lte(payrollTaxCalculations.calculatedAt, asOfDate)
      )
    );

    if (calculations.length === 0) {
      return '0';
    }

    // Sum up all gross income
    const totalEarnings = calculations.reduce(
      (sum: Decimal, calc: PayrollTaxCalculation) => sum.plus(calc.grossIncome),
      new Decimal(0)
    );

    return totalEarnings.toString();
  }

  /**
   * Get employee's YTD withholding for a specific tax
   */
  private async getYTDWithholding(
    employeeId: number,
    jurisdictionId: number,
    taxType: "income" | "social_security" | "medicare" | "sui" | "sdi" | "futa" | "suta" | "local_income" | "transit" | "occupational",
    asOfDate: Date
  ): Promise<string> {
    // Get all payroll calculations for this employee, jurisdiction, and tax type in the current year
    const year = asOfDate.getFullYear();
    const startOfYear = new Date(year, 0, 1);

    const calculations = await db.select().from(payrollTaxCalculations).where(
      and(
        eq(payrollTaxCalculations.employeeId, employeeId),
        eq(payrollTaxCalculations.jurisdictionId, jurisdictionId),
        eq(payrollTaxCalculations.taxType, taxType),
        gte(payrollTaxCalculations.calculatedAt, startOfYear),
        lte(payrollTaxCalculations.calculatedAt, asOfDate)
      )
    );

    if (calculations.length === 0) {
      return '0';
    }

    // Sum up all tax amounts
    const totalWithholding = calculations.reduce(
      (sum: Decimal, calc: PayrollTaxCalculation) => sum.plus(calc.taxAmount),
      new Decimal(0)
    );

    return totalWithholding.toString();
  }

  /**
   * Calculate flat rate tax
   */
  private async calculateFlatRateTax(
    payrollRunId: number,
    employeeId: number,
    jurisdiction: TaxJurisdiction,
    taxTable: TaxTable,
    grossIncome: Decimal,
    taxElection?: EmployeeTaxElection,
    ytdEarnings?: string,
    ytdWithholding?: string
  ): Promise<PayrollTaxCalculation> {
    if (!taxTable.taxRate) {
      throw new Error(`Tax rate not defined for tax table ID ${taxTable.id}`);
    }

    const taxableIncome = grossIncome;
    const rate = new Decimal(taxTable.taxRate.toString());
    let taxAmount = taxableIncome.times(rate);

    // Add additional withholding if specified in tax election
    if (taxElection?.additionalWithholding) {
      taxAmount = taxAmount.plus(taxElection.additionalWithholding);
    }

    // Create calculation record
    const calculation: Omit<PayrollTaxCalculation, 'id' | 'createdAt' | 'updatedAt'> = {
      payrollRunId,
      employeeId,
      jurisdictionId: jurisdiction.id,
      taxTableId: taxTable.id,
      taxType: taxTable.taxType,
      grossIncome: grossIncome.toString(),
      taxableIncome: taxableIncome.toString(),
      taxAmount: taxAmount.toString(),
      ytdEarnings: ytdEarnings || '0',
      ytdTaxWithheld: ytdWithholding || '0',
      calculationDetails: {
        method: 'flat_rate',
        rate: taxTable.taxRate.toString(),
        additionalWithholding: taxElection?.additionalWithholding?.toString() || '0'
      },
      calculatedAt: new Date(),
      isActive: true
    };

    // Insert calculation into database
    const [result] = await db.insert(payrollTaxCalculations).values(calculation).returning();
    return result;
  }

  /**
   * Calculate progressive tax (tax brackets)
   */
  private async calculateProgressiveTax(
    payrollRunId: number,
    employeeId: number,
    jurisdiction: TaxJurisdiction,
    taxTable: TaxTable,
    grossIncome: Decimal,
    taxElection?: EmployeeTaxElection,
    ytdEarnings?: string,
    ytdWithholding?: string
  ): Promise<PayrollTaxCalculation> {
    // Get tax brackets for this tax table
    const brackets = await db.select().from(taxBrackets)
      .where(eq(taxBrackets.taxTableId, taxTable.id))
      .orderBy(asc(taxBrackets.lowerBound));

    if (brackets.length === 0) {
      throw new Error(`No tax brackets found for tax table ID ${taxTable.id}`);
    }

    let taxableIncome = grossIncome;
    
    // Apply allowances if applicable (simplified W-4 allowance calculation)
    if (taxElection?.allowances && taxTable.taxType === 'income') {
      // This is a simplified implementation
      // In reality, this would involve a more complex calculation based on the tax year and jurisdiction
      const allowanceAmount = new Decimal(4300); // Example annual allowance amount for 2023
      const payPeriodAdjustment = this.getPayPeriodAdjustmentFactor(taxTable.payFrequency || 'biweekly');
      const totalAllowanceDeduction = allowanceAmount.times(taxElection.allowances).times(payPeriodAdjustment);
      
      // Ensure we don't reduce below zero
      taxableIncome = Decimal.max(0, taxableIncome.minus(totalAllowanceDeduction));
    }

    // Calculate tax using brackets
    let taxAmount = new Decimal(0);
    const bracketCalculations = [];

    for (let i = 0; i < brackets.length; i++) {
      const bracket = brackets[i];
      const lowerBound = new Decimal(bracket.lowerBound.toString());
      const upperBound = bracket.upperBound ? new Decimal(bracket.upperBound.toString()) : null;
      const rate = new Decimal(bracket.rate.toString());
      
      // Skip this bracket if income is lower than the bracket's lower bound
      if (taxableIncome.lessThan(lowerBound)) {
        continue;
      }
      
      let bracketAmount;
      
      if (!upperBound || taxableIncome.lessThanOrEqualTo(upperBound)) {
        // Income falls within this bracket
        bracketAmount = taxableIncome.minus(lowerBound).times(rate);
        if (bracket.fixedAmount) {
          bracketAmount = bracketAmount.plus(bracket.fixedAmount);
        }
        bracketCalculations.push({
          bracketId: bracket.id,
          lowerBound: bracket.lowerBound.toString(),
          upperBound: upperBound ? upperBound.toString() : 'unlimited',
          rate: bracket.rate.toString(),
          amount: bracketAmount.toString()
        });
        taxAmount = taxAmount.plus(bracketAmount);
        break;
      } else {
        // Income exceeds this bracket, calculate tax for the full bracket range
        bracketAmount = upperBound.minus(lowerBound).times(rate);
        if (bracket.fixedAmount) {
          bracketAmount = bracketAmount.plus(bracket.fixedAmount);
        }
        bracketCalculations.push({
          bracketId: bracket.id,
          lowerBound: bracket.lowerBound.toString(),
          upperBound: upperBound.toString(),
          rate: bracket.rate.toString(),
          amount: bracketAmount.toString()
        });
        taxAmount = taxAmount.plus(bracketAmount);
      }
    }

    // Add additional withholding if specified in tax election
    if (taxElection?.additionalWithholding) {
      taxAmount = taxAmount.plus(taxElection.additionalWithholding);
    }

    // Create calculation record
    const calculation: Omit<PayrollTaxCalculation, 'id' | 'createdAt' | 'updatedAt'> = {
      payrollRunId,
      employeeId,
      jurisdictionId: jurisdiction.id,
      taxTableId: taxTable.id,
      taxType: taxTable.taxType,
      grossIncome: grossIncome.toString(),
      taxableIncome: taxableIncome.toString(),
      taxAmount: taxAmount.toString(),
      ytdEarnings: ytdEarnings || '0',
      ytdTaxWithheld: ytdWithholding || '0',
      calculationDetails: {
        method: 'progressive',
        brackets: bracketCalculations,
        filingStatus: taxElection?.filingStatus || taxTable.filingStatus,
        allowances: taxElection?.allowances || 0,
        additionalWithholding: taxElection?.additionalWithholding?.toString() || '0'
      },
      calculatedAt: new Date(),
      isActive: true
    };

    // Insert calculation into database
    const [result] = await db.insert(payrollTaxCalculations).values(calculation).returning();
    return result;
  }

  /**
   * Calculate fixed amount tax
   */
  private async calculateFixedAmountTax(
    payrollRunId: number,
    employeeId: number,
    jurisdiction: TaxJurisdiction,
    taxTable: TaxTable,
    grossIncome: Decimal,
    taxElection?: EmployeeTaxElection,
    ytdEarnings?: string,
    ytdWithholding?: string
  ): Promise<PayrollTaxCalculation> {
    if (!taxTable.fixedAmount) {
      throw new Error(`Fixed amount not defined for tax table ID ${taxTable.id}`);
    }

    const taxableIncome = grossIncome;
    let taxAmount = new Decimal(taxTable.fixedAmount.toString());

    // Add additional withholding if specified in tax election
    if (taxElection?.additionalWithholding) {
      taxAmount = taxAmount.plus(taxElection.additionalWithholding);
    }

    // Create calculation record
    const calculation: Omit<PayrollTaxCalculation, 'id' | 'createdAt' | 'updatedAt'> = {
      payrollRunId,
      employeeId,
      jurisdictionId: jurisdiction.id,
      taxTableId: taxTable.id,
      taxType: taxTable.taxType,
      grossIncome: grossIncome.toString(),
      taxableIncome: taxableIncome.toString(),
      taxAmount: taxAmount.toString(),
      ytdEarnings: ytdEarnings || '0',
      ytdTaxWithheld: ytdWithholding || '0',
      calculationDetails: {
        method: 'fixed_amount',
        fixedAmount: taxTable.fixedAmount.toString(),
        additionalWithholding: taxElection?.additionalWithholding?.toString() || '0'
      },
      calculatedAt: new Date(),
      isActive: true
    };

    // Insert calculation into database
    const [result] = await db.insert(payrollTaxCalculations).values(calculation).returning();
    return result;
  }

  /**
   * Calculate percentage with cap tax
   */
  private async calculatePercentageWithCapTax(
    payrollRunId: number,
    employeeId: number,
    jurisdiction: TaxJurisdiction,
    taxTable: TaxTable,
    grossIncome: Decimal,
    taxElection?: EmployeeTaxElection,
    ytdEarnings?: string,
    ytdWithholding?: string
  ): Promise<PayrollTaxCalculation> {
    if (!taxTable.taxRate || !taxTable.wageBase) {
      throw new Error(`Tax rate or wage base not defined for tax table ID ${taxTable.id}`);
    }

    const taxableIncome = grossIncome;
    const rate = new Decimal(taxTable.taxRate.toString());
    const wageBase = new Decimal(taxTable.wageBase.toString());
    const ytdEarningsDecimal = new Decimal(ytdEarnings || '0');
    
    // Check if YTD earnings already exceed wage base
    if (ytdEarningsDecimal.greaterThanOrEqualTo(wageBase)) {
      // Already exceeded cap, no tax due
      return this.createExemptTaxCalculation(
        payrollRunId,
        employeeId,
        jurisdiction.id,
        taxTable.id,
        taxTable.taxType,
        grossIncome.toString(),
        {
          method: 'percentage_with_cap',
          rate: taxTable.taxRate.toString(),
          wageBase: taxTable.wageBase.toString(),
          ytdEarnings: ytdEarningsDecimal.toString(),
          reason: 'YTD earnings exceed wage base'
        }
      );
    }
    
    // Calculate remaining taxable amount before hitting wage base
    const remainingBeforeCap = Decimal.max(0, wageBase.minus(ytdEarningsDecimal));
    
    // Only tax up to the remaining amount before hitting wage base
    const effectiveTaxableIncome = Decimal.min(taxableIncome, remainingBeforeCap);
    let taxAmount = effectiveTaxableIncome.times(rate);

    // Add additional withholding if specified in tax election
    if (taxElection?.additionalWithholding) {
      taxAmount = taxAmount.plus(taxElection.additionalWithholding);
    }

    // Create calculation record
    const calculation: Omit<PayrollTaxCalculation, 'id' | 'createdAt' | 'updatedAt'> = {
      payrollRunId,
      employeeId,
      jurisdictionId: jurisdiction.id,
      taxTableId: taxTable.id,
      taxType: taxTable.taxType,
      grossIncome: grossIncome.toString(),
      taxableIncome: effectiveTaxableIncome.toString(),
      taxAmount: taxAmount.toString(),
      ytdEarnings: ytdEarnings || '0',
      ytdTaxWithheld: ytdWithholding || '0',
      calculationDetails: {
        method: 'percentage_with_cap',
        rate: taxTable.taxRate.toString(),
        wageBase: taxTable.wageBase.toString(),
        remainingBeforeCap: remainingBeforeCap.toString(),
        additionalWithholding: taxElection?.additionalWithholding?.toString() || '0',
        partialApplication: !taxableIncome.equals(effectiveTaxableIncome)
      },
      calculatedAt: new Date(),
      isActive: true
    };

    // Insert calculation into database
    const [result] = await db.insert(payrollTaxCalculations).values(calculation).returning();
    return result;
  }

  /**
   * Calculate wage base tax (e.g., Social Security)
   */
  private async calculateWageBaseTax(
    payrollRunId: number,
    employeeId: number,
    jurisdiction: TaxJurisdiction,
    taxTable: TaxTable,
    grossIncome: Decimal,
    taxElection?: EmployeeTaxElection,
    ytdEarnings?: string,
    ytdWithholding?: string
  ): Promise<PayrollTaxCalculation> {
    if (!taxTable.taxRate || !taxTable.wageBase) {
      throw new Error(`Tax rate or wage base not defined for tax table ID ${taxTable.id}`);
    }

    const taxableIncome = grossIncome;
    const rate = new Decimal(taxTable.taxRate.toString());
    const wageBase = new Decimal(taxTable.wageBase.toString());
    
    // Adjust wage base for pay period if needed
    let adjustedWageBase = wageBase;
    if (taxTable.wageBasePeriod !== 'annually') {
      // No adjustment needed if wageBasePeriod matches the pay frequency
      // This is a simplified approach, in reality the adjustment would be more complex
    }
    
    const ytdEarningsDecimal = new Decimal(ytdEarnings || '0');
    
    // Check if YTD earnings already exceed wage base
    if (ytdEarningsDecimal.greaterThanOrEqualTo(adjustedWageBase)) {
      // Already exceeded wage base, no tax due
      return this.createExemptTaxCalculation(
        payrollRunId,
        employeeId,
        jurisdiction.id,
        taxTable.id,
        taxTable.taxType,
        grossIncome.toString(),
        {
          method: 'wage_base',
          rate: taxTable.taxRate.toString(),
          wageBase: adjustedWageBase.toString(),
          ytdEarnings: ytdEarningsDecimal.toString(),
          reason: 'YTD earnings exceed wage base'
        }
      );
    }
    
    // Calculate remaining taxable amount before hitting wage base
    const remainingBeforeCap = Decimal.max(0, adjustedWageBase.minus(ytdEarningsDecimal));
    
    // Only tax up to the remaining amount before hitting wage base
    const effectiveTaxableIncome = Decimal.min(taxableIncome, remainingBeforeCap);
    let taxAmount = effectiveTaxableIncome.times(rate);

    // Add additional withholding if specified in tax election
    if (taxElection?.additionalWithholding) {
      taxAmount = taxAmount.plus(taxElection.additionalWithholding);
    }

    // Create calculation record
    const calculation: Omit<PayrollTaxCalculation, 'id' | 'createdAt' | 'updatedAt'> = {
      payrollRunId,
      employeeId,
      jurisdictionId: jurisdiction.id,
      taxTableId: taxTable.id,
      taxType: taxTable.taxType,
      grossIncome: grossIncome.toString(),
      taxableIncome: effectiveTaxableIncome.toString(),
      taxAmount: taxAmount.toString(),
      ytdEarnings: ytdEarnings || '0',
      ytdTaxWithheld: ytdWithholding || '0',
      calculationDetails: {
        method: 'wage_base',
        rate: taxTable.taxRate.toString(),
        wageBase: adjustedWageBase.toString(),
        wageBasePeriod: taxTable.wageBasePeriod,
        remainingBeforeCap: remainingBeforeCap.toString(),
        additionalWithholding: taxElection?.additionalWithholding?.toString() || '0',
        partialApplication: !taxableIncome.equals(effectiveTaxableIncome)
      },
      calculatedAt: new Date(),
      isActive: true
    };

    // Insert calculation into database
    const [result] = await db.insert(payrollTaxCalculations).values(calculation).returning();
    return result;
  }

  /**
   * Create a tax calculation record for exempt taxes
   */
  private async createExemptTaxCalculation(
    payrollRunId: number,
    employeeId: number,
    jurisdictionId: number,
    taxTableId: number,
    taxType: "income" | "social_security" | "medicare" | "sui" | "sdi" | "futa" | "suta" | "local_income" | "transit" | "occupational",
    grossIncome: string,
    calculationDetails: any = { method: 'exempt', reason: 'Employee exemption' }
  ): Promise<PayrollTaxCalculation> {
    const calculation: Omit<PayrollTaxCalculation, 'id' | 'createdAt' | 'updatedAt'> = {
      payrollRunId,
      employeeId,
      jurisdictionId,
      taxTableId,
      taxType,
      grossIncome,
      taxableIncome: '0',
      taxAmount: '0',
      ytdEarnings: '0',
      ytdTaxWithheld: '0',
      calculationDetails,
      calculatedAt: new Date(),
      isActive: true
    };

    // Insert calculation into database
    const [result] = await db.insert(payrollTaxCalculations).values(calculation).returning();
    return result;
  }

  /**
   * Process special tax situations
   */
  private async processSpecialTaxSituations(
    employeeId: number,
    payrollRunId: number,
    taxCalculations: PayrollTaxCalculation[],
    payPeriodStart: Date,
    payPeriodEnd: Date
  ): Promise<void> {
    // Get any special tax situations for this employee
    const specialSituations = await db.select().from(specialTaxSituations).where(
      and(
        eq(specialTaxSituations.employeeId, employeeId),
        lte(specialTaxSituations.effectiveDate, payPeriodEnd),
        or(
          isNull(specialTaxSituations.expirationDate),
          gte(specialTaxSituations.expirationDate, payPeriodStart)
        )
      )
    );

    if (specialSituations.length === 0) {
      return;
    }

    // Process each special situation
    for (const situation of specialSituations) {
      switch (situation.situationType) {
        case 'tax_exempt':
          // Mark all taxes as exempt
          for (const calculation of taxCalculations) {
            await db.update(payrollTaxCalculations)
              .set({
                taxableIncome: '0',
                taxAmount: '0',
                calculationDetails: Object.assign({}, calculation.calculationDetails, {
                  specialSituation: {
                    type: situation.situationType,
                    description: situation.description
                  }
                })
              })
              .where(eq(payrollTaxCalculations.id, calculation.id));
          }
          break;
          
        case 'reduced_withholding':
          // Reduce withholding by a percentage (simplified)
          const reductionPercent = 0.5; // Example: 50% reduction
          for (const calculation of taxCalculations) {
            if (calculation.taxAmount !== '0') {
              const reducedAmount = new Decimal(calculation.taxAmount).times(reductionPercent);
              await db.update(payrollTaxCalculations)
                .set({
                  taxAmount: reducedAmount.toString(),
                  calculationDetails: Object.assign({}, calculation.calculationDetails, {
                    specialSituation: {
                      type: situation.situationType,
                      description: situation.description,
                      reductionPercent: reductionPercent
                    }
                  })
                })
                .where(eq(payrollTaxCalculations.id, calculation.id));
            }
          }
          break;
          
        // Additional special situations could be handled here
        default:
          console.log(`Unhandled special tax situation: ${situation.situationType}`);
      }
    }
  }

  /**
   * Get pay period adjustment factor for allowances
   */
  private getPayPeriodAdjustmentFactor(payFrequency: string): number {
    switch (payFrequency) {
      case 'weekly':
        return 1/52;
      case 'biweekly':
        return 1/26;
      case 'semimonthly':
        return 1/24;
      case 'monthly':
        return 1/12;
      case 'quarterly':
        return 1/4;
      case 'annually':
        return 1;
      default:
        return 1/26; // Default to biweekly
    }
  }

  /**
   * Update tax tables from external source
   * This would be used to update tax rates and brackets based on IRS or state tax authority updates
   */
  async updateTaxTables(
    source: string,
    updateData: any,
    performedBy?: number
  ): Promise<boolean> {
    try {
      // Start a transaction
      return await db.transaction(async (tx) => {
        let affectedTables = [];
        
        // Process jurisdiction updates if present
        if (updateData.jurisdictions) {
          for (const jurisdiction of updateData.jurisdictions) {
            if (jurisdiction.id) {
              // Update existing jurisdiction
              await tx.update(taxJurisdictions)
                .set({
                  name: jurisdiction.name,
                  code: jurisdiction.code,
                  isActive: jurisdiction.isActive,
                  expirationDate: jurisdiction.expirationDate,
                  updatedAt: new Date()
                })
                .where(eq(taxJurisdictions.id, jurisdiction.id));
            } else {
              // Create new jurisdiction
              await tx.insert(taxJurisdictions).values({
                name: jurisdiction.name,
                code: jurisdiction.code,
                type: jurisdiction.type,
                parentJurisdictionId: jurisdiction.parentJurisdictionId,
                effectiveDate: jurisdiction.effectiveDate || new Date(),
                isActive: jurisdiction.isActive !== false
              });
            }
          }
          affectedTables.push('tax_jurisdictions');
        }
        
        // Process tax table updates if present
        if (updateData.taxTables) {
          for (const taxTable of updateData.taxTables) {
            if (taxTable.id) {
              // Update existing tax table
              await tx.update(taxTables)
                .set({
                  taxRate: taxTable.taxRate,
                  wageBase: taxTable.wageBase,
                  fixedAmount: taxTable.fixedAmount,
                  isActive: taxTable.isActive,
                  expirationDate: taxTable.expirationDate,
                  updatedAt: new Date()
                })
                .where(eq(taxTables.id, taxTable.id));
            } else {
              // Create new tax table
              await tx.insert(taxTables).values({
                jurisdictionId: taxTable.jurisdictionId,
                taxType: taxTable.taxType,
                calculationMethod: taxTable.calculationMethod,
                filingStatus: taxTable.filingStatus,
                payFrequency: taxTable.payFrequency,
                effectiveDate: taxTable.effectiveDate || new Date(),
                taxRate: taxTable.taxRate,
                wageBase: taxTable.wageBase,
                wageBasePeriod: taxTable.wageBasePeriod || 'annually',
                fixedAmount: taxTable.fixedAmount,
                isActive: taxTable.isActive !== false
              });
            }
          }
          affectedTables.push('tax_tables');
        }
        
        // Process tax bracket updates if present
        if (updateData.taxBrackets) {
          for (const bracket of updateData.taxBrackets) {
            if (bracket.id) {
              // Update existing bracket
              await tx.update(taxBrackets)
                .set({
                  lowerBound: bracket.lowerBound,
                  upperBound: bracket.upperBound,
                  rate: bracket.rate,
                  fixedAmount: bracket.fixedAmount,
                  updatedAt: new Date()
                })
                .where(eq(taxBrackets.id, bracket.id));
            } else {
              // Create new bracket
              await tx.insert(taxBrackets).values({
                taxTableId: bracket.taxTableId,
                lowerBound: bracket.lowerBound,
                upperBound: bracket.upperBound,
                rate: bracket.rate,
                fixedAmount: bracket.fixedAmount
              });
            }
          }
          affectedTables.push('tax_brackets');
        }
        
        // Log the update
        await tx.insert(taxUpdateLogs).values({
          updateType: 'tax_table_update',
          source,
          affectedTables: affectedTables.join(','),
          changeDescription: updateData.description || 'Tax tables update',
          changeDetails: updateData,
          performedBy,
          isAutomatic: !performedBy,
          performedAt: new Date()
        });
        
        return true;
      });
    } catch (error) {
      console.error('Error updating tax tables:', error);
      return false;
    }
  }
}

// Export an instance of the service
export const taxCalculationService = new TaxCalculationService();