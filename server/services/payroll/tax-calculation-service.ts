/**
 * Tax Calculation Service
 * 
 * This service handles all tax-related calculations for payroll processing.
 * It implements complex tax rules for federal, state, local, and FICA taxes
 * based on current tax rates, employee profiles, and payroll data.
 */

import { db } from "../../db";
import { 
  federalTaxBrackets, stateTaxBrackets, ficaRates, taxAllowances,
  employeeTaxProfiles, taxCalculations, payrollEntries,
  type FederalTaxBracket, type StateTaxBracket, type FicaRate,
  type TaxAllowance, type EmployeeTaxProfile, type TaxCalculation,
  type InsertTaxCalculation
} from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { Decimal } from "decimal.js";

/**
 * Main Tax Calculation Service Class
 */
export class TaxCalculationService {
  
  /**
   * Calculate all tax withholdings for a payroll entry
   * 
   * @param payrollEntryId The ID of the payroll entry
   * @param userId The ID of the employee
   * @param grossPay The gross pay amount
   * @param year The tax year to use for calculations
   * @param performedById The ID of the user performing the calculation
   */
  async calculateTaxes(
    payrollEntryId: number,
    userId: number,
    grossPay: string | number | Decimal,
    year: number,
    performedById: number
  ): Promise<TaxCalculation> {
    // Convert gross pay to Decimal for precise calculations
    const grossPayDecimal = new Decimal(grossPay);
    
    // Retrieve employee tax profile
    const taxProfile = await this.getEmployeeTaxProfile(userId, year);
    
    // Retrieve necessary data for tax calculations
    const [
      fedTaxBrackets,
      stateTaxBrackets, 
      ficaRatesData,
      taxAllowance,
      ytdData,
    ] = await Promise.all([
      this.getFederalTaxBrackets(year, taxProfile?.filingStatus || "single"),
      this.getStateTaxBrackets(year, taxProfile?.stateOfResidence || "CA", taxProfile?.filingStatus || "single"),
      this.getFicaRates(year),
      this.getTaxAllowance(year),
      this.getYTDPayrollData(userId, year, payrollEntryId)
    ]);
    
    // If any required data is missing, throw an error
    if (!taxProfile || !fedTaxBrackets.length || !ficaRatesData) {
      throw new Error("Missing required tax data for calculation");
    }
    
    // Calculate each tax component
    const federalTaxableIncome = this.calculateFederalTaxableIncome(grossPayDecimal, taxProfile, taxAllowance);
    const stateTaxableIncome = this.calculateStateTaxableIncome(grossPayDecimal, taxProfile, taxAllowance);
    
    const federalWithholding = this.calculateFederalWithholding(
      federalTaxableIncome, 
      taxProfile,
      fedTaxBrackets
    );
    
    const stateWithholding = this.calculateStateWithholding(
      stateTaxableIncome,
      taxProfile,
      stateTaxBrackets || []
    );
    
    const { socialSecurityWithholding, medicareWithholding } = this.calculateFicaTaxes(
      grossPayDecimal,
      ytdData.ytdGrossEarnings,
      ficaRatesData
    );
    
    const localTaxWithholding = this.calculateLocalTax(
      grossPayDecimal,
      taxProfile
    );
    
    // Calculate total withholding
    const totalWithholding = federalWithholding
      .plus(stateWithholding)
      .plus(socialSecurityWithholding)
      .plus(medicareWithholding)
      .plus(localTaxWithholding);
    
    // Calculate YTD totals
    const ytdFederalWithholding = ytdData.ytdFederalWithholding.plus(federalWithholding);
    const ytdStateWithholding = ytdData.ytdStateWithholding.plus(stateWithholding);
    const ytdSocialSecurityWithholding = ytdData.ytdSocialSecurityWithholding.plus(socialSecurityWithholding);
    const ytdMedicareWithholding = ytdData.ytdMedicareWithholding.plus(medicareWithholding);
    const ytdGrossEarnings = ytdData.ytdGrossEarnings.plus(grossPayDecimal);
    
    // Create tax calculation record
    const taxCalculation: InsertTaxCalculation = {
      payrollEntryId,
      federalTaxableIncome: federalTaxableIncome.toString(),
      stateTaxableIncome: stateTaxableIncome.toString(),
      federalWithholding: federalWithholding.toString(),
      stateWithholding: stateWithholding.toString(),
      socialSecurityWithholding: socialSecurityWithholding.toString(),
      medicareWithholding: medicareWithholding.toString(),
      localTaxWithholding: localTaxWithholding.toString(),
      totalWithholding: totalWithholding.toString(),
      ytdGrossEarnings: ytdGrossEarnings.toString(),
      ytdFederalWithholding: ytdFederalWithholding.toString(), 
      ytdStateWithholding: ytdStateWithholding.toString(),
      ytdSocialSecurityWithholding: ytdSocialSecurityWithholding.toString(),
      ytdMedicareWithholding: ytdMedicareWithholding.toString(),
      calculationMethod: "percentage", // Could be dynamic based on rules
      calculationNotes: "Standard calculation based on current tax rates and employee profile",
      performedBy: performedById
    };
    
    // Store the calculation in the database
    const [savedCalculation] = await db.insert(taxCalculations)
      .values(taxCalculation)
      .returning();
    
    // Update payroll entry with tax withholding amounts
    await db.update(payrollEntries)
      .set({
        federalTax: federalWithholding.toString(),
        stateTax: stateWithholding.toString(),
        socialSecurity: socialSecurityWithholding.toString(),
        medicare: medicareWithholding.toString(),
        // Update net pay
        netPay: new Decimal(grossPay).minus(totalWithholding).toString()
      })
      .where(eq(payrollEntries.id, payrollEntryId));
    
    return savedCalculation;
  }
  
  /**
   * Calculate federal taxable income
   */
  private calculateFederalTaxableIncome(
    grossPay: Decimal, 
    taxProfile: EmployeeTaxProfile,
    taxAllowance?: TaxAllowance
  ): Decimal {
    if (taxProfile.exemptFromFederal) {
      return new Decimal(0);
    }
    
    // Start with gross pay
    let taxableIncome = grossPay;
    
    // Apply pre-tax deductions (HSA, 401k, etc.) - These would come from the payroll entry
    // This is simplified for now
    const preTaxDeductions = new Decimal(0);
    taxableIncome = taxableIncome.minus(preTaxDeductions);
    
    // Apply standard deduction (prorated for pay period)
    if (taxAllowance) {
      let standardDeduction = new Decimal(0);
      
      switch (taxProfile.filingStatus) {
        case "married_joint":
          standardDeduction = new Decimal(taxAllowance.standardDeductionJoint);
          break;
        case "head_of_household":
          standardDeduction = new Decimal(taxAllowance.standardDeductionHeadOfHousehold);
          break;
        default: // single, married_separate, qualifying_widow
          standardDeduction = new Decimal(taxAllowance.standardDeductionSingle);
      }
      
      // Prorate for pay period (assuming bi-weekly)
      standardDeduction = standardDeduction.dividedBy(26);
      
      taxableIncome = taxableIncome.minus(standardDeduction);
    }
    
    // Apply allowances (old W-4 method)
    if (taxProfile.allowances > 0 && taxAllowance) {
      const allowanceAmount = new Decimal(taxAllowance.personalExemptionAmount)
        .dividedBy(26) // Bi-weekly pay periods
        .times(taxProfile.allowances);
      
      taxableIncome = taxableIncome.minus(allowanceAmount);
    }
    
    // Ensure taxable income is not negative
    return taxableIncome.lessThan(0) ? new Decimal(0) : taxableIncome;
  }
  
  /**
   * Calculate state taxable income
   */
  private calculateStateTaxableIncome(
    grossPay: Decimal, 
    taxProfile: EmployeeTaxProfile,
    taxAllowance?: TaxAllowance
  ): Decimal {
    if (taxProfile.exemptFromState) {
      return new Decimal(0);
    }
    
    // State taxable income calculation often differs by state
    // This is a simplified version similar to federal but would need state-specific logic
    let taxableIncome = grossPay;
    
    // Apply state-specific pre-tax deductions
    const preTaxDeductions = new Decimal(0);
    taxableIncome = taxableIncome.minus(preTaxDeductions);
    
    // Apply state standard deduction (varies by state)
    // For simplicity, using federal standard deduction
    if (taxAllowance) {
      let standardDeduction = new Decimal(0);
      
      switch (taxProfile.filingStatus) {
        case "married_joint":
          standardDeduction = new Decimal(taxAllowance.standardDeductionJoint);
          break;
        case "head_of_household":
          standardDeduction = new Decimal(taxAllowance.standardDeductionHeadOfHousehold);
          break;
        default: // single, married_separate, qualifying_widow
          standardDeduction = new Decimal(taxAllowance.standardDeductionSingle);
      }
      
      // Prorate for pay period and typically states have lower deduction
      standardDeduction = standardDeduction.dividedBy(26).times(0.7); // 70% of federal as example
      
      taxableIncome = taxableIncome.minus(standardDeduction);
    }
    
    // Ensure taxable income is not negative
    return taxableIncome.lessThan(0) ? new Decimal(0) : taxableIncome;
  }
  
  /**
   * Calculate federal income tax withholding
   */
  private calculateFederalWithholding(
    taxableIncome: Decimal,
    taxProfile: EmployeeTaxProfile,
    taxBrackets: FederalTaxBracket[]
  ): Decimal {
    if (taxProfile.exemptFromFederal || taxableIncome.isZero()) {
      return new Decimal(0);
    }
    
    // Annualize the taxable income for bracket calculation
    const annualizedIncome = taxableIncome.times(26); // Assuming bi-weekly pay
    
    // Find the applicable tax bracket
    const bracket = taxBrackets.find(b => 
      annualizedIncome.greaterThanOrEqualTo(b.incomeFrom) && 
      (!b.incomeTo || annualizedIncome.lessThan(b.incomeTo))
    );
    
    if (!bracket) {
      throw new Error("No matching tax bracket found");
    }
    
    // Calculate tax amount
    let taxAmount: Decimal;
    
    if (bracket.baseAmount) {
      // Using the simplified bracket calculation with base amount
      const incomeOverBracketMin = annualizedIncome.minus(bracket.incomeFrom);
      const bracketTax = incomeOverBracketMin.times(bracket.rate);
      taxAmount = new Decimal(bracket.baseAmount).plus(bracketTax);
    } else {
      // Calculate tax directly based on the rate
      taxAmount = annualizedIncome.times(bracket.rate);
    }
    
    // Convert annual tax to per-paycheck tax
    let perPaycheckTax = taxAmount.dividedBy(26);
    
    // Add any additional withholding specified by employee
    if (taxProfile.additionalWithholding) {
      perPaycheckTax = perPaycheckTax.plus(taxProfile.additionalWithholding);
    }
    
    return perPaycheckTax;
  }
  
  /**
   * Calculate state income tax withholding
   */
  private calculateStateWithholding(
    taxableIncome: Decimal,
    taxProfile: EmployeeTaxProfile,
    taxBrackets: StateTaxBracket[]
  ): Decimal {
    if (taxProfile.exemptFromState || taxableIncome.isZero()) {
      return new Decimal(0);
    }
    
    // Some states have no income tax
    const noTaxStates = ["AK", "FL", "NV", "NH", "SD", "TN", "TX", "WA", "WY"];
    if (noTaxStates.includes(taxProfile.stateOfResidence)) {
      return new Decimal(0);
    }
    
    // If no brackets available for the state, use a flat rate estimate
    if (!taxBrackets.length) {
      // Fallback to average state tax rate of 5%
      return taxableIncome.times(0.05);
    }
    
    // Annualize the taxable income for bracket calculation
    const annualizedIncome = taxableIncome.times(26); // Assuming bi-weekly pay
    
    // Find the applicable tax bracket
    const bracket = taxBrackets.find(b => 
      annualizedIncome.greaterThanOrEqualTo(b.incomeFrom) && 
      (!b.incomeTo || annualizedIncome.lessThan(b.incomeTo))
    );
    
    if (!bracket) {
      // If no bracket found, use highest bracket
      const highestBracket = taxBrackets[taxBrackets.length - 1];
      const taxAmount = annualizedIncome.times(highestBracket.rate);
      return taxAmount.dividedBy(26); // Convert to per-paycheck
    }
    
    // Calculate tax amount
    let taxAmount: Decimal;
    
    if (bracket.baseAmount) {
      // Using the simplified bracket calculation with base amount
      const incomeOverBracketMin = annualizedIncome.minus(bracket.incomeFrom);
      const bracketTax = incomeOverBracketMin.times(bracket.rate);
      taxAmount = new Decimal(bracket.baseAmount).plus(bracketTax);
    } else {
      // Calculate tax directly based on the rate
      taxAmount = annualizedIncome.times(bracket.rate);
    }
    
    // Convert annual tax to per-paycheck tax
    return taxAmount.dividedBy(26);
  }
  
  /**
   * Calculate FICA taxes (Social Security and Medicare)
   */
  private calculateFicaTaxes(
    grossPay: Decimal,
    ytdGrossEarnings: Decimal,
    ficaRates: FicaRate
  ): { socialSecurityWithholding: Decimal, medicareWithholding: Decimal } {
    // Initialize withholding amounts
    let socialSecurityWithholding = new Decimal(0);
    let medicareWithholding = new Decimal(0);
    
    // Calculate Social Security
    const ssRate = new Decimal(ficaRates.socialSecurityRate);
    const ssWageCap = new Decimal(ficaRates.socialSecurityWageCap);
    
    // Check if employee has already hit the Social Security wage cap
    const newYtdEarnings = ytdGrossEarnings.plus(grossPay);
    
    if (ytdGrossEarnings.greaterThanOrEqualTo(ssWageCap)) {
      // Already hit the cap, no more SS tax
      socialSecurityWithholding = new Decimal(0);
    } else if (newYtdEarnings.greaterThan(ssWageCap)) {
      // This paycheck will hit the cap
      const taxableAmount = ssWageCap.minus(ytdGrossEarnings);
      socialSecurityWithholding = taxableAmount.times(ssRate);
    } else {
      // Normal case - below the cap
      socialSecurityWithholding = grossPay.times(ssRate);
    }
    
    // Calculate Medicare
    const medicareRate = new Decimal(ficaRates.medicareRate);
    medicareWithholding = grossPay.times(medicareRate);
    
    // Calculate Additional Medicare Tax for high earners
    const additionalMedicareRate = new Decimal(ficaRates.additionalMedicareRate);
    const additionalMedicareThreshold = new Decimal(ficaRates.additionalMedicareThreshold);
    
    if (newYtdEarnings.greaterThan(additionalMedicareThreshold)) {
      if (ytdGrossEarnings.greaterThanOrEqualTo(additionalMedicareThreshold)) {
        // All of this paycheck is subject to additional Medicare tax
        const additionalTax = grossPay.times(additionalMedicareRate);
        medicareWithholding = medicareWithholding.plus(additionalTax);
      } else {
        // Part of this paycheck is subject to additional Medicare tax
        const taxableAmount = newYtdEarnings.minus(additionalMedicareThreshold);
        const additionalTax = taxableAmount.times(additionalMedicareRate);
        medicareWithholding = medicareWithholding.plus(additionalTax);
      }
    }
    
    return { socialSecurityWithholding, medicareWithholding };
  }
  
  /**
   * Calculate local tax withholding
   */
  private calculateLocalTax(
    grossPay: Decimal,
    taxProfile: EmployeeTaxProfile
  ): Decimal {
    if (taxProfile.exemptFromLocalTax || !taxProfile.localTaxRate) {
      return new Decimal(0);
    }
    
    // Simple multiplication of gross pay by local tax rate
    return grossPay.times(taxProfile.localTaxRate);
  }
  
  /**
   * Get employee tax profile for the specified year
   */
  private async getEmployeeTaxProfile(userId: number, year: number): Promise<EmployeeTaxProfile | undefined> {
    const [profile] = await db.select()
      .from(employeeTaxProfiles)
      .where(
        and(
          eq(employeeTaxProfiles.userId, userId),
          eq(employeeTaxProfiles.year, year)
        )
      );
    
    return profile;
  }
  
  /**
   * Get federal tax brackets for the specified year and filing status
   */
  private async getFederalTaxBrackets(year: number, filingStatus: string): Promise<FederalTaxBracket[]> {
    return db.select()
      .from(federalTaxBrackets)
      .where(
        and(
          eq(federalTaxBrackets.year, year),
          eq(federalTaxBrackets.filingStatus, filingStatus)
        )
      )
      .orderBy(federalTaxBrackets.bracketOrder);
  }
  
  /**
   * Get state tax brackets for the specified state, year, and filing status
   */
  private async getStateTaxBrackets(year: number, state: string, filingStatus: string): Promise<StateTaxBracket[]> {
    return db.select()
      .from(stateTaxBrackets)
      .where(
        and(
          eq(stateTaxBrackets.year, year),
          eq(stateTaxBrackets.state, state),
          eq(stateTaxBrackets.filingStatus, filingStatus)
        )
      )
      .orderBy(stateTaxBrackets.bracketOrder);
  }
  
  /**
   * Get FICA rates for the specified year
   */
  private async getFicaRates(year: number): Promise<FicaRate | undefined> {
    const [rates] = await db.select()
      .from(ficaRates)
      .where(eq(ficaRates.year, year));
    
    return rates;
  }
  
  /**
   * Get tax allowances for the specified year
   */
  private async getTaxAllowance(year: number): Promise<TaxAllowance | undefined> {
    const [allowance] = await db.select()
      .from(taxAllowances)
      .where(eq(taxAllowances.year, year));
    
    return allowance;
  }
  
  /**
   * Get YTD payroll data for the specified employee and year
   */
  private async getYTDPayrollData(userId: number, year: number, currentPayrollEntryId: number): Promise<{
    ytdGrossEarnings: Decimal,
    ytdFederalWithholding: Decimal,
    ytdStateWithholding: Decimal,
    ytdSocialSecurityWithholding: Decimal,
    ytdMedicareWithholding: Decimal
  }> {
    // Get start of year date
    const startOfYear = new Date(year, 0, 1);
    
    // Get payroll entries for this employee this year (excluding current entry)
    const entries = await db.select({
      grossPay: payrollEntries.grossPay,
      federalTax: payrollEntries.federalTax,
      stateTax: payrollEntries.stateTax,
      socialSecurity: payrollEntries.socialSecurity,
      medicare: payrollEntries.medicare
    })
    .from(payrollEntries)
    .where(
      and(
        eq(payrollEntries.userId, userId),
        gte(payrollEntries.payPeriodStart, startOfYear),
        eq(payrollEntries.status, "completed")
      )
    );
    
    // Sum up YTD totals
    const ytdGrossEarnings = entries.reduce(
      (sum, entry) => sum.plus(entry.grossPay || 0), 
      new Decimal(0)
    );
    
    const ytdFederalWithholding = entries.reduce(
      (sum, entry) => sum.plus(entry.federalTax || 0), 
      new Decimal(0)
    );
    
    const ytdStateWithholding = entries.reduce(
      (sum, entry) => sum.plus(entry.stateTax || 0), 
      new Decimal(0)
    );
    
    const ytdSocialSecurityWithholding = entries.reduce(
      (sum, entry) => sum.plus(entry.socialSecurity || 0), 
      new Decimal(0)
    );
    
    const ytdMedicareWithholding = entries.reduce(
      (sum, entry) => sum.plus(entry.medicare || 0), 
      new Decimal(0)
    );
    
    return {
      ytdGrossEarnings,
      ytdFederalWithholding,
      ytdStateWithholding,
      ytdSocialSecurityWithholding,
      ytdMedicareWithholding
    };
  }
  
  /**
   * Create or update an employee tax profile
   */
  async upsertEmployeeTaxProfile(profile: {
    userId: number;
    year: number;
    filingStatus: string;
    allowances: number;
    additionalWithholding?: string | number;
    exemptFromFederal?: boolean;
    exemptFromState?: boolean;
    exemptFromLocalTax?: boolean;
    stateOfResidence: string;
    stateOfEmployment: string;
    localTaxJurisdiction?: string;
    localTaxRate?: string | number;
    annualSalaryEstimate?: string | number;
    hasMultipleJobs?: boolean;
    spouseWorks?: boolean;
    specialTaxCredits?: Record<string, any>;
  }): Promise<EmployeeTaxProfile> {
    // Check if profile already exists
    const [existingProfile] = await db.select()
      .from(employeeTaxProfiles)
      .where(
        and(
          eq(employeeTaxProfiles.userId, profile.userId),
          eq(employeeTaxProfiles.year, profile.year)
        )
      );
    
    if (existingProfile) {
      // Update existing profile
      const [updatedProfile] = await db.update(employeeTaxProfiles)
        .set({
          filingStatus: profile.filingStatus,
          allowances: profile.allowances,
          additionalWithholding: profile.additionalWithholding?.toString(),
          exemptFromFederal: profile.exemptFromFederal,
          exemptFromState: profile.exemptFromState,
          exemptFromLocalTax: profile.exemptFromLocalTax,
          stateOfResidence: profile.stateOfResidence,
          stateOfEmployment: profile.stateOfEmployment,
          localTaxJurisdiction: profile.localTaxJurisdiction,
          localTaxRate: profile.localTaxRate?.toString(),
          annualSalaryEstimate: profile.annualSalaryEstimate?.toString(),
          hasMultipleJobs: profile.hasMultipleJobs,
          spouseWorks: profile.spouseWorks,
          specialTaxCredits: profile.specialTaxCredits,
          updatedAt: new Date()
        })
        .where(eq(employeeTaxProfiles.id, existingProfile.id))
        .returning();
      
      return updatedProfile;
    } else {
      // Create new profile
      const [newProfile] = await db.insert(employeeTaxProfiles)
        .values({
          userId: profile.userId,
          year: profile.year,
          filingStatus: profile.filingStatus,
          allowances: profile.allowances,
          additionalWithholding: profile.additionalWithholding?.toString(),
          exemptFromFederal: profile.exemptFromFederal,
          exemptFromState: profile.exemptFromState,
          exemptFromLocalTax: profile.exemptFromLocalTax,
          stateOfResidence: profile.stateOfResidence,
          stateOfEmployment: profile.stateOfEmployment,
          localTaxJurisdiction: profile.localTaxJurisdiction,
          localTaxRate: profile.localTaxRate?.toString(),
          annualSalaryEstimate: profile.annualSalaryEstimate?.toString(),
          hasMultipleJobs: profile.hasMultipleJobs,
          spouseWorks: profile.spouseWorks,
          specialTaxCredits: profile.specialTaxCredits
        })
        .returning();
      
      return newProfile;
    }
  }
}

export const taxCalculationService = new TaxCalculationService();