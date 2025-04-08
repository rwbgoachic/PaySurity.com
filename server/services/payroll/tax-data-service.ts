/**
 * Tax Data Service
 * 
 * This service manages tax data, including:
 * - Tax brackets for federal and state income taxes
 * - FICA tax rates and thresholds
 * - Standard deductions and allowances
 * - Bulk import and export of tax data
 */

import { db } from "../../db";
import { 
  federalTaxBrackets, stateTaxBrackets, ficaRates, taxAllowances,
  type FederalTaxBracket, type StateTaxBracket, type FicaRate,
  type TaxAllowance, type InsertFederalTaxBracket, type InsertStateTaxBracket,
  type InsertFicaRate, type InsertTaxAllowance
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Tax Data Service for managing tax rates and brackets
 */
export class TaxDataService {
  
  /**
   * Get tax rates and data for a specific year
   * 
   * @param year The tax year to retrieve data for
   */
  async getTaxDataForYear(year: number): Promise<{
    federalBrackets: FederalTaxBracket[];
    stateBrackets: Record<string, StateTaxBracket[]>;
    ficaRates: FicaRate | null;
    taxAllowances: TaxAllowance | null;
  }> {
    // Get federal tax brackets for all filing statuses
    const federalBrackets = await db.select()
      .from(federalTaxBrackets)
      .where(eq(federalTaxBrackets.year, year))
      .orderBy(federalTaxBrackets.filingStatus, federalTaxBrackets.bracketOrder);
    
    // Get state tax brackets for all states and filing statuses
    const stateBracketsRaw = await db.select()
      .from(stateTaxBrackets)
      .where(eq(stateTaxBrackets.year, year))
      .orderBy(stateTaxBrackets.state, stateTaxBrackets.filingStatus, stateTaxBrackets.bracketOrder);
    
    // Organize state brackets by state code
    const stateBrackets: Record<string, StateTaxBracket[]> = {};
    for (const bracket of stateBracketsRaw) {
      if (!stateBrackets[bracket.state]) {
        stateBrackets[bracket.state] = [];
      }
      stateBrackets[bracket.state].push(bracket);
    }
    
    // Get FICA rates for the year
    const [ficaRatesData] = await db.select()
      .from(ficaRates)
      .where(eq(ficaRates.year, year));
    
    // Get tax allowances for the year
    const [allowances] = await db.select()
      .from(taxAllowances)
      .where(eq(taxAllowances.year, year));
    
    return {
      federalBrackets,
      stateBrackets,
      ficaRates: ficaRatesData || null,
      taxAllowances: allowances || null
    };
  }
  
  /**
   * Create or update federal tax brackets for a specific year and filing status
   * 
   * @param year The tax year
   * @param filingStatus The filing status
   * @param brackets Array of tax brackets
   */
  async upsertFederalTaxBrackets(
    year: number, 
    filingStatus: string,
    brackets: {
      incomeFrom: string | number;
      incomeTo?: string | number;
      rate: string | number;
      baseAmount?: string | number;
    }[]
  ): Promise<FederalTaxBracket[]> {
    // First, delete existing brackets for this year and filing status
    await db.delete(federalTaxBrackets)
      .where(
        and(
          eq(federalTaxBrackets.year, year),
          eq(federalTaxBrackets.filingStatus, filingStatus)
        )
      );
    
    // Then insert the new brackets
    const bracketInserts: InsertFederalTaxBracket[] = brackets.map((bracket, index) => ({
      year,
      filingStatus,
      bracketOrder: index,
      incomeFrom: bracket.incomeFrom.toString(),
      incomeTo: bracket.incomeTo?.toString(),
      rate: bracket.rate.toString(),
      baseAmount: bracket.baseAmount?.toString()
    }));
    
    const insertedBrackets = await db.insert(federalTaxBrackets)
      .values(bracketInserts)
      .returning();
    
    return insertedBrackets;
  }
  
  /**
   * Create or update state tax brackets for a specific state, year, and filing status
   * 
   * @param state The state code
   * @param year The tax year
   * @param filingStatus The filing status
   * @param brackets Array of tax brackets
   */
  async upsertStateTaxBrackets(
    state: string,
    year: number,
    filingStatus: string,
    brackets: {
      incomeFrom: string | number;
      incomeTo?: string | number;
      rate: string | number;
      baseAmount?: string | number;
    }[]
  ): Promise<StateTaxBracket[]> {
    // First, delete existing brackets for this state, year, and filing status
    await db.delete(stateTaxBrackets)
      .where(
        and(
          eq(stateTaxBrackets.state, state),
          eq(stateTaxBrackets.year, year),
          eq(stateTaxBrackets.filingStatus, filingStatus)
        )
      );
    
    // Then insert the new brackets
    const bracketInserts: InsertStateTaxBracket[] = brackets.map((bracket, index) => ({
      state,
      year,
      filingStatus,
      bracketOrder: index,
      incomeFrom: bracket.incomeFrom.toString(),
      incomeTo: bracket.incomeTo?.toString(),
      rate: bracket.rate.toString(),
      baseAmount: bracket.baseAmount?.toString()
    }));
    
    const insertedBrackets = await db.insert(stateTaxBrackets)
      .values(bracketInserts)
      .returning();
    
    return insertedBrackets;
  }
  
  /**
   * Create or update FICA rates for a specific year
   * 
   * @param year The tax year
   * @param ratesData FICA rates data
   */
  async upsertFicaRates(
    year: number,
    ratesData: {
      socialSecurityRate: string | number;
      socialSecurityWageCap: string | number;
      medicareRate: string | number;
      additionalMedicareRate: string | number;
      additionalMedicareThreshold: string | number;
      additionalMedicareThresholdJoint?: string | number;
    }
  ): Promise<FicaRate> {
    // Check if rates already exist for this year
    const [existingRates] = await db.select()
      .from(ficaRates)
      .where(eq(ficaRates.year, year));
    
    if (existingRates) {
      // Update existing rates
      const [updatedRates] = await db.update(ficaRates)
        .set({
          socialSecurityRate: ratesData.socialSecurityRate.toString(),
          socialSecurityWageCap: ratesData.socialSecurityWageCap.toString(),
          medicareRate: ratesData.medicareRate.toString(),
          additionalMedicareRate: ratesData.additionalMedicareRate.toString(),
          additionalMedicareThreshold: ratesData.additionalMedicareThreshold.toString(),
          additionalMedicareThresholdJoint: ratesData.additionalMedicareThresholdJoint?.toString(),
          updatedAt: new Date()
        })
        .where(eq(ficaRates.id, existingRates.id))
        .returning();
      
      return updatedRates;
    } else {
      // Insert new rates
      const [newRates] = await db.insert(ficaRates)
        .values({
          year,
          socialSecurityRate: ratesData.socialSecurityRate.toString(),
          socialSecurityWageCap: ratesData.socialSecurityWageCap.toString(),
          medicareRate: ratesData.medicareRate.toString(),
          additionalMedicareRate: ratesData.additionalMedicareRate.toString(),
          additionalMedicareThreshold: ratesData.additionalMedicareThreshold.toString(),
          additionalMedicareThresholdJoint: ratesData.additionalMedicareThresholdJoint?.toString()
        })
        .returning();
      
      return newRates;
    }
  }
  
  /**
   * Create or update tax allowances for a specific year
   * 
   * @param year The tax year
   * @param allowanceData Tax allowance data
   */
  async upsertTaxAllowances(
    year: number,
    allowanceData: {
      standardDeductionSingle: string | number;
      standardDeductionJoint: string | number;
      standardDeductionHeadOfHousehold: string | number;
      personalExemptionAmount: string | number;
      personalExemptionPhaseoutStart?: string | number;
      personalExemptionPhaseoutEnd?: string | number;
    }
  ): Promise<TaxAllowance> {
    // Check if allowances already exist for this year
    const [existingAllowances] = await db.select()
      .from(taxAllowances)
      .where(eq(taxAllowances.year, year));
    
    if (existingAllowances) {
      // Update existing allowances
      const [updatedAllowances] = await db.update(taxAllowances)
        .set({
          standardDeductionSingle: allowanceData.standardDeductionSingle.toString(),
          standardDeductionJoint: allowanceData.standardDeductionJoint.toString(),
          standardDeductionHeadOfHousehold: allowanceData.standardDeductionHeadOfHousehold.toString(),
          personalExemptionAmount: allowanceData.personalExemptionAmount.toString(),
          personalExemptionPhaseoutStart: allowanceData.personalExemptionPhaseoutStart?.toString(),
          personalExemptionPhaseoutEnd: allowanceData.personalExemptionPhaseoutEnd?.toString(),
          updatedAt: new Date()
        })
        .where(eq(taxAllowances.id, existingAllowances.id))
        .returning();
      
      return updatedAllowances;
    } else {
      // Insert new allowances
      const [newAllowances] = await db.insert(taxAllowances)
        .values({
          year,
          standardDeductionSingle: allowanceData.standardDeductionSingle.toString(),
          standardDeductionJoint: allowanceData.standardDeductionJoint.toString(),
          standardDeductionHeadOfHousehold: allowanceData.standardDeductionHeadOfHousehold.toString(),
          personalExemptionAmount: allowanceData.personalExemptionAmount.toString(),
          personalExemptionPhaseoutStart: allowanceData.personalExemptionPhaseoutStart?.toString(),
          personalExemptionPhaseoutEnd: allowanceData.personalExemptionPhaseoutEnd?.toString()
        })
        .returning();
      
      return newAllowances;
    }
  }
  
  /**
   * Get the most recent available tax year data
   */
  async getMostRecentTaxYear(): Promise<number | null> {
    // Check federal tax brackets for the most recent year
    const [mostRecentFederal] = await db.select({ year: federalTaxBrackets.year })
      .from(federalTaxBrackets)
      .orderBy(desc(federalTaxBrackets.year))
      .limit(1);
    
    if (mostRecentFederal) {
      return mostRecentFederal.year;
    }
    
    // Check FICA rates for the most recent year
    const [mostRecentFica] = await db.select({ year: ficaRates.year })
      .from(ficaRates)
      .orderBy(desc(ficaRates.year))
      .limit(1);
    
    if (mostRecentFica) {
      return mostRecentFica.year;
    }
    
    // No tax data found
    return null;
  }
  
  /**
   * Clone tax data from one year to another
   * 
   * @param sourceYear The year to copy data from
   * @param targetYear The year to copy data to
   * @param options Options for what data to clone
   */
  async cloneTaxYear(
    sourceYear: number,
    targetYear: number,
    options: {
      cloneFederalBrackets?: boolean;
      cloneStateBrackets?: boolean;
      cloneFicaRates?: boolean;
      cloneTaxAllowances?: boolean;
    } = {
      cloneFederalBrackets: true,
      cloneStateBrackets: true,
      cloneFicaRates: true,
      cloneTaxAllowances: true
    }
  ): Promise<boolean> {
    // Check if source year exists
    const sourceYearData = await this.getTaxDataForYear(sourceYear);
    
    if (!sourceYearData.federalBrackets.length && !sourceYearData.ficaRates && !sourceYearData.taxAllowances) {
      throw new Error(`No tax data found for source year: ${sourceYear}`);
    }
    
    // Clone federal tax brackets
    if (options.cloneFederalBrackets && sourceYearData.federalBrackets.length > 0) {
      // Group federal brackets by filing status
      const federalBracketsByStatus: Record<string, FederalTaxBracket[]> = {};
      for (const bracket of sourceYearData.federalBrackets) {
        if (!federalBracketsByStatus[bracket.filingStatus]) {
          federalBracketsByStatus[bracket.filingStatus] = [];
        }
        federalBracketsByStatus[bracket.filingStatus].push(bracket);
      }
      
      // Clone each filing status
      for (const [filingStatus, brackets] of Object.entries(federalBracketsByStatus)) {
        const bracketData = brackets.map(b => ({
          incomeFrom: b.incomeFrom,
          incomeTo: b.incomeTo,
          rate: b.rate,
          baseAmount: b.baseAmount
        }));
        
        await this.upsertFederalTaxBrackets(targetYear, filingStatus, bracketData);
      }
    }
    
    // Clone state tax brackets
    if (options.cloneStateBrackets && Object.keys(sourceYearData.stateBrackets).length > 0) {
      for (const [state, brackets] of Object.entries(sourceYearData.stateBrackets)) {
        // Group state brackets by filing status
        const bracketsByStatus: Record<string, StateTaxBracket[]> = {};
        for (const bracket of brackets) {
          if (!bracketsByStatus[bracket.filingStatus]) {
            bracketsByStatus[bracket.filingStatus] = [];
          }
          bracketsByStatus[bracket.filingStatus].push(bracket);
        }
        
        // Clone each filing status
        for (const [filingStatus, stateBrackets] of Object.entries(bracketsByStatus)) {
          const bracketData = stateBrackets.map(b => ({
            incomeFrom: b.incomeFrom,
            incomeTo: b.incomeTo,
            rate: b.rate,
            baseAmount: b.baseAmount
          }));
          
          await this.upsertStateTaxBrackets(state, targetYear, filingStatus, bracketData);
        }
      }
    }
    
    // Clone FICA rates
    if (options.cloneFicaRates && sourceYearData.ficaRates) {
      await this.upsertFicaRates(targetYear, {
        socialSecurityRate: sourceYearData.ficaRates.socialSecurityRate,
        socialSecurityWageCap: sourceYearData.ficaRates.socialSecurityWageCap,
        medicareRate: sourceYearData.ficaRates.medicareRate,
        additionalMedicareRate: sourceYearData.ficaRates.additionalMedicareRate,
        additionalMedicareThreshold: sourceYearData.ficaRates.additionalMedicareThreshold,
        additionalMedicareThresholdJoint: sourceYearData.ficaRates.additionalMedicareThresholdJoint
      });
    }
    
    // Clone tax allowances
    if (options.cloneTaxAllowances && sourceYearData.taxAllowances) {
      await this.upsertTaxAllowances(targetYear, {
        standardDeductionSingle: sourceYearData.taxAllowances.standardDeductionSingle,
        standardDeductionJoint: sourceYearData.taxAllowances.standardDeductionJoint,
        standardDeductionHeadOfHousehold: sourceYearData.taxAllowances.standardDeductionHeadOfHousehold,
        personalExemptionAmount: sourceYearData.taxAllowances.personalExemptionAmount,
        personalExemptionPhaseoutStart: sourceYearData.taxAllowances.personalExemptionPhaseoutStart,
        personalExemptionPhaseoutEnd: sourceYearData.taxAllowances.personalExemptionPhaseoutEnd
      });
    }
    
    return true;
  }
  
  /**
   * Initialize tax data with default values for the current year
   * This is useful for demo purposes or initial setup
   */
  async initializeDefaultTaxData(year: number = new Date().getFullYear()): Promise<boolean> {
    // Create federal tax brackets for single filing status (2023 values)
    await this.upsertFederalTaxBrackets(year, "single", [
      { incomeFrom: 0, incomeTo: 10275, rate: 0.10 },
      { incomeFrom: 10275, incomeTo: 41775, rate: 0.12, baseAmount: 1027.50 },
      { incomeFrom: 41775, incomeTo: 89075, rate: 0.22, baseAmount: 4807.50 },
      { incomeFrom: 89075, incomeTo: 170050, rate: 0.24, baseAmount: 15213.50 },
      { incomeFrom: 170050, incomeTo: 215950, rate: 0.32, baseAmount: 34647.50 },
      { incomeFrom: 215950, incomeTo: 539900, rate: 0.35, baseAmount: 49335.50 },
      { incomeFrom: 539900, incomeTo: null, rate: 0.37, baseAmount: 162718.00 }
    ]);
    
    // Create federal tax brackets for married_joint filing status
    await this.upsertFederalTaxBrackets(year, "married_joint", [
      { incomeFrom: 0, incomeTo: 20550, rate: 0.10 },
      { incomeFrom: 20550, incomeTo: 83550, rate: 0.12, baseAmount: 2055.00 },
      { incomeFrom: 83550, incomeTo: 178150, rate: 0.22, baseAmount: 9615.00 },
      { incomeFrom: 178150, incomeTo: 340100, rate: 0.24, baseAmount: 30427.00 },
      { incomeFrom: 340100, incomeTo: 431900, rate: 0.32, baseAmount: 69295.00 },
      { incomeFrom: 431900, incomeTo: 647850, rate: 0.35, baseAmount: 98671.00 },
      { incomeFrom: 647850, incomeTo: null, rate: 0.37, baseAmount: 174253.50 }
    ]);
    
    // Create federal tax brackets for head_of_household filing status
    await this.upsertFederalTaxBrackets(year, "head_of_household", [
      { incomeFrom: 0, incomeTo: 14650, rate: 0.10 },
      { incomeFrom: 14650, incomeTo: 55900, rate: 0.12, baseAmount: 1465.00 },
      { incomeFrom: 55900, incomeTo: 89050, rate: 0.22, baseAmount: 6415.00 },
      { incomeFrom: 89050, incomeTo: 170050, rate: 0.24, baseAmount: 13708.00 },
      { incomeFrom: 170050, incomeTo: 215950, rate: 0.32, baseAmount: 33148.00 },
      { incomeFrom: 215950, incomeTo: 539900, rate: 0.35, baseAmount: 47836.00 },
      { incomeFrom: 539900, incomeTo: null, rate: 0.37, baseAmount: 161218.50 }
    ]);
    
    // Create California state tax brackets (as an example)
    await this.upsertStateTaxBrackets(year, "CA", "single", [
      { incomeFrom: 0, incomeTo: 10099, rate: 0.01 },
      { incomeFrom: 10099, incomeTo: 23942, rate: 0.02, baseAmount: 100.99 },
      { incomeFrom: 23942, incomeTo: 37788, rate: 0.04, baseAmount: 377.85 },
      { incomeFrom: 37788, incomeTo: 52455, rate: 0.06, baseAmount: 931.69 },
      { incomeFrom: 52455, incomeTo: 66295, rate: 0.08, baseAmount: 1811.71 },
      { incomeFrom: 66295, incomeTo: 338639, rate: 0.093, baseAmount: 2918.91 },
      { incomeFrom: 338639, incomeTo: 406364, rate: 0.103, baseAmount: 28246.90 },
      { incomeFrom: 406364, incomeTo: 677275, rate: 0.113, baseAmount: 35222.58 },
      { incomeFrom: 677275, incomeTo: null, rate: 0.123, baseAmount: 65835.52 }
    ]);
    
    // Create FICA rates (2023 values)
    await this.upsertFicaRates(year, {
      socialSecurityRate: 0.062, // 6.2%
      socialSecurityWageCap: 160200, // Social Security wage base limit
      medicareRate: 0.0145, // 1.45%
      additionalMedicareRate: 0.009, // 0.9% additional Medicare tax
      additionalMedicareThreshold: 200000, // Single threshold
      additionalMedicareThresholdJoint: 250000 // Married filing jointly threshold
    });
    
    // Create tax allowances (2023 values)
    await this.upsertTaxAllowances(year, {
      standardDeductionSingle: 13850,
      standardDeductionJoint: 27700,
      standardDeductionHeadOfHousehold: 20800,
      personalExemptionAmount: 4050, // Although this is technically zero in 2023, using the pre-TCJA value for withholding calculations
      personalExemptionPhaseoutStart: 313800,
      personalExemptionPhaseoutEnd: 436300
    });
    
    return true;
  }
}

export const taxDataService = new TaxDataService();