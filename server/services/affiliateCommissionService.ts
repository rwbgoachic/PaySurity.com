import { storage } from '../storage';
import { AffiliatePayout, MerchantReferral } from '@shared/schema';
import Decimal from 'decimal.js';

interface CommissionResult {
  amount: string;
  milestoneName: string;
  status: "pending" | "paid" | "clawed_back" | "canceled";
  notes?: string;
}

/**
 * Service to calculate and manage affiliate commissions based on 
 * transaction volumes and milestones
 */
export class AffiliateCommissionService {
  
  /**
   * Calculate commission for a 7-day milestone
   * $25 when customer doesn't cancel within 7 days
   */
  async calculateSevenDayCommission(referral: MerchantReferral): Promise<CommissionResult | null> {
    // Check if merchant has been active for at least 7 days
    const activationDate = referral.activationDate;
    if (!activationDate) return null;
    
    const now = new Date();
    const daysSinceActivation = Math.floor((now.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceActivation < 7) return null;
    
    // Check if milestone has already been reached
    if (referral.sevenDayMilestoneReached) return null;
    
    return {
      amount: "25.00",
      milestoneName: "seven_day",
      status: "pending"
    };
  }
  
  /**
   * Calculate commission for a 30-day milestone
   * $25 when customer is active for 30 days and processes ≥ $2,500
   */
  async calculateThirtyDayCommission(referral: MerchantReferral): Promise<CommissionResult | null> {
    // Check if merchant has been active for at least 30 days
    const activationDate = referral.activationDate;
    if (!activationDate) return null;
    
    const now = new Date();
    const daysSinceActivation = Math.floor((now.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceActivation < 30) return null;
    
    // Check if milestone has already been reached
    if (referral.thirtyDayMilestoneReached) return null;
    
    // Check if the transaction volume is at least $2,500
    const volume = new Decimal(referral.transactionVolume30Days || 0);
    if (volume.lessThan(2500)) return null;
    
    return {
      amount: "25.00",
      milestoneName: "thirty_day",
      status: "pending"
    };
  }
  
  /**
   * Calculate commission for a 90-day milestone
   * $25 + 5% of PaySurity's commission from Days 1-90
   * when customer is active for 90 days and processes ≥ $7,500 total
   */
  async calculateNinetyDayCommission(referral: MerchantReferral): Promise<CommissionResult | null> {
    // Check if merchant has been active for at least 90 days
    const activationDate = referral.activationDate;
    if (!activationDate) return null;
    
    const now = new Date();
    const daysSinceActivation = Math.floor((now.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceActivation < 90) return null;
    
    // Check if milestone has already been reached
    if (referral.ninetyDayMilestoneReached) return null;
    
    // Check if the transaction volume is at least $7,500
    const volume = new Decimal(referral.transactionVolume90Days || 0);
    if (volume.lessThan(7500)) return null;
    
    // Calculate 5% of PaySurity's 1% commission from transaction volume
    const paysurityCommission = volume.mul(0.01); // 1% of volume
    const affiliateCommission = paysurityCommission.mul(0.05); // 5% of PaySurity's commission
    
    // Total commission: $25 base + percentage of commission
    const totalCommission = new Decimal(25).plus(affiliateCommission);
    
    return {
      amount: totalCommission.toFixed(2),
      milestoneName: "ninety_day",
      status: "pending",
      notes: `Base $25 + 5% of commission (${affiliateCommission.toFixed(2)})`
    };
  }
  
  /**
   * Calculate commission for a 180-day milestone
   * $25 + 6.25% of PaySurity's commission from Days 91-180
   * when customer processes ≥ $15,000 between Days 91-180
   */
  async calculateOneEightyDayCommission(referral: MerchantReferral): Promise<CommissionResult | null> {
    // Check if merchant has been active for at least 180 days
    const activationDate = referral.activationDate;
    if (!activationDate) return null;
    
    const now = new Date();
    const daysSinceActivation = Math.floor((now.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceActivation < 180) return null;
    
    // Check if milestone has already been reached
    if (referral.oneEightyDayMilestoneReached) return null;
    
    // Calculate volume between days 91-180
    // For this calculation, we'll need to get transaction data between these dates
    // This is a simplified approach assuming we track total 180-day volume
    const volume180Days = new Decimal(referral.transactionVolume180Days || 0);
    const volume90Days = new Decimal(referral.transactionVolume90Days || 0);
    const volume91To180Days = volume180Days.minus(volume90Days);
    
    // Check if the transaction volume between days 91-180 is at least $15,000
    if (volume91To180Days.lessThan(15000)) return null;
    
    // Calculate 6.25% of PaySurity's 1% commission from transaction volume
    const paysurityCommission = volume91To180Days.mul(0.01); // 1% of volume
    const affiliateCommission = paysurityCommission.mul(0.0625); // 6.25% of PaySurity's commission
    
    // Total commission: $25 base + percentage of commission
    const totalCommission = new Decimal(25).plus(affiliateCommission);
    
    return {
      amount: totalCommission.toFixed(2),
      milestoneName: "one_eighty_day",
      status: "pending",
      notes: `Base $25 + 6.25% of commission (${affiliateCommission.toFixed(2)})`
    };
  }
  
  /**
   * Calculate recurring monthly commission after 180 days
   * $25 + 5% of PaySurity's commission per month
   * when customer processes ≥ $5,000/month after Day 180
   */
  async calculateRecurringCommission(referral: MerchantReferral): Promise<CommissionResult | null> {
    // Check if merchant has been active for at least 180 days
    const activationDate = referral.activationDate;
    if (!activationDate) return null;
    
    const now = new Date();
    const daysSinceActivation = Math.floor((now.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceActivation < 180) return null;
    
    // Check if transaction volume for the month is at least $5,000
    const monthlyVolume = new Decimal(referral.transactionVolumeMonthly || 0);
    if (monthlyVolume.lessThan(5000)) return null;
    
    // Calculate 5% of PaySurity's 1% commission from monthly transaction volume
    const paysurityCommission = monthlyVolume.mul(0.01); // 1% of volume
    const affiliateCommission = paysurityCommission.mul(0.05); // 5% of PaySurity's commission
    
    // Total commission: $25 base + percentage of commission
    const totalCommission = new Decimal(25).plus(affiliateCommission);
    
    // For recurring monthly commissions, we need to check if we already paid this month
    // We'll use the current month/year as part of our milestone name
    const monthYear = `${now.getMonth() + 1}_${now.getFullYear()}`;
    const milestoneName = `recurring_${monthYear}`;
    
    // Check if we've already paid this milestone
    const existingPayout = await this.getExistingPayout(referral.id, milestoneName);
    if (existingPayout) return null;
    
    return {
      amount: totalCommission.toFixed(2),
      milestoneName,
      status: "pending",
      notes: `Monthly recurring commission for ${monthYear}`
    };
  }
  
  /**
   * Calculate loyalty bonus after 365 days
   * $25 + 6.67% of PaySurity's commission per month
   * when customer is active for 365+ days and processes ≥ $5,000/month
   */
  async calculateLoyaltyCommission(referral: MerchantReferral): Promise<CommissionResult | null> {
    // Check if merchant has been active for at least 365 days
    const activationDate = referral.activationDate;
    if (!activationDate) return null;
    
    const now = new Date();
    const daysSinceActivation = Math.floor((now.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceActivation < 365) return null;
    
    // Check if the merchant reached the 365-day milestone
    if (!referral.threeSixtyFiveDayMilestoneReached) {
      // Update the milestone flag first
      await storage.updateMerchantReferralMilestone(referral.id, "three_sixty_five_day", true);
    }
    
    // Check if transaction volume for the month is at least $5,000
    const monthlyVolume = new Decimal(referral.transactionVolumeMonthly || 0);
    if (monthlyVolume.lessThan(5000)) return null;
    
    // Calculate 5% of PaySurity's 1% commission from monthly transaction volume
    const paysurityCommission = monthlyVolume.mul(0.01); // 1% of volume
    const affiliateCommission = paysurityCommission.mul(0.0667); // 6.67% of PaySurity's commission
    
    // Total commission: $25 base + percentage of commission  
    const totalCommission = new Decimal(25).plus(affiliateCommission);
    
    // For loyalty commissions, we need to check if we already paid this month
    // We'll use the current month/year as part of our milestone name
    const monthYear = `${now.getMonth() + 1}_${now.getFullYear()}`;
    const milestoneName = `loyalty_${monthYear}`;
    
    // Check if we've already paid this milestone
    const existingPayout = await this.getExistingPayout(referral.id, milestoneName);
    if (existingPayout) return null;
    
    return {
      amount: totalCommission.toFixed(2),
      milestoneName,
      status: "pending",
      notes: `Loyalty bonus for ${monthYear}`
    };
  }
  
  /**
   * Calculate high-volume bonus
   * +$25/month per customer processing ≥ $100,000/month
   */
  async calculateHighVolumeBonus(referral: MerchantReferral): Promise<CommissionResult | null> {
    // Check if transaction volume for the month is at least $100,000
    const monthlyVolume = new Decimal(referral.transactionVolumeMonthly || 0);
    if (monthlyVolume.lessThan(100000)) return null;
    
    // For high-volume bonuses, we need to check if we already paid this month
    const now = new Date();
    const monthYear = `${now.getMonth() + 1}_${now.getFullYear()}`;
    const milestoneName = `high_volume_${monthYear}`;
    
    // Check if we've already paid this milestone
    const existingPayout = await this.getExistingPayout(referral.id, milestoneName);
    if (existingPayout) return null;
    
    return {
      amount: "25.00",
      milestoneName,
      status: "pending",
      notes: `High-volume bonus for ${monthYear}`
    };
  }
  
  /**
   * Calculate bulk referral bonus
   * +$300/month for referring 10+ customers each processing ≥ $3,000/month
   */
  async calculateBulkReferralBonus(affiliateId: number): Promise<CommissionResult | null> {
    // Get all active referrals for this affiliate
    const referrals = await storage.getMerchantReferralsByAffiliateId(affiliateId);
    
    // Filter for active referrals with at least $3,000 in monthly volume
    const qualifyingReferrals = referrals.filter(referral => {
      return referral.status === 'active' && 
             new Decimal(referral.transactionVolumeMonthly || 0).greaterThanOrEqualTo(3000);
    });
    
    // Check if there are at least 10 qualifying referrals
    if (qualifyingReferrals.length < 10) return null;
    
    // For bulk referral bonuses, we need to check if we already paid this month
    const now = new Date();
    const monthYear = `${now.getMonth() + 1}_${now.getFullYear()}`;
    const milestoneName = `bulk_referral_${monthYear}`;
    
    // We'll use the first referral ID for this bonus
    const firstReferralId = qualifyingReferrals[0].id;
    
    // Check if we've already paid this milestone
    const existingPayout = await this.getExistingPayout(firstReferralId, milestoneName);
    if (existingPayout) return null;
    
    return {
      amount: "300.00",
      milestoneName,
      status: "pending",
      notes: `Bulk referral bonus for ${qualifyingReferrals.length} active merchants with $3,000+ monthly volume`
    };
  }
  
  /**
   * Check if a payout has already been made for a given referral and milestone
   */
  async getExistingPayout(referralId: number, milestoneName: string): Promise<AffiliatePayout | null> {
    const payouts = await storage.getAffiliatePayoutsByReferralId(referralId);
    const existingPayout = payouts.find(p => p.milestoneName === milestoneName);
    return existingPayout || null;
  }
  
  /**
   * Create a payout record for an affiliate
   */
  async createPayout(affiliateId: number, referralId: number, commission: CommissionResult): Promise<AffiliatePayout> {
    // Calculate scheduled date (usually 7 days from now for review)
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 7);
    
    // Convert date to ISO string for database
    const scheduledDateStr = scheduledDate.toISOString().split('T')[0];
    
    const payout = await storage.createAffiliatePayout({
      affiliateId,
      referralId,
      milestoneName: commission.milestoneName,
      amount: commission.amount,
      status: commission.status,
      scheduledDate: scheduledDateStr,
      notes: commission.notes
    });
    
    // Update the affiliate's pending payouts
    const affiliate = await storage.getAffiliateProfile(affiliateId);
    if (affiliate) {
      const currentPending = new Decimal(affiliate.pendingPayouts || 0);
      const newPending = currentPending.plus(commission.amount).toString();
      
      await storage.updateAffiliateStats(
        affiliateId,
        undefined,
        newPending,
        undefined,
        undefined
      );
    }
    
    return payout;
  }
  
  /**
   * Update referral milestone flags when a milestone is reached
   */
  async updateMilestoneFlags(referralId: number, milestoneName: string): Promise<void> {
    switch (milestoneName) {
      case "seven_day":
        await storage.updateMerchantReferralMilestone(referralId, "seven_day", true);
        break;
      case "thirty_day":
        await storage.updateMerchantReferralMilestone(referralId, "thirty_day", true);
        break;
      case "ninety_day":
        await storage.updateMerchantReferralMilestone(referralId, "ninety_day", true);
        break;
      case "one_eighty_day":
        await storage.updateMerchantReferralMilestone(referralId, "one_eighty_day", true);
        break;
    }
  }
  
  /**
   * Process a single referral for commission calculations
   * Checks all possible milestones and creates payouts as needed
   */
  async processReferral(referral: MerchantReferral): Promise<void> {
    // Skip processing if referral is not active
    if (referral.status !== 'active') return;
    
    // Calculate commissions for each milestone
    const commissions: { [key: string]: CommissionResult | null } = {
      sevenDay: await this.calculateSevenDayCommission(referral),
      thirtyDay: await this.calculateThirtyDayCommission(referral),
      ninetyDay: await this.calculateNinetyDayCommission(referral),
      oneEightyDay: await this.calculateOneEightyDayCommission(referral),
      recurring: await this.calculateRecurringCommission(referral),
      loyalty: await this.calculateLoyaltyCommission(referral),
      highVolume: await this.calculateHighVolumeBonus(referral)
    };
    
    // Create payouts for each applicable milestone
    for (const [key, commission] of Object.entries(commissions)) {
      if (commission) {
        const payout = await this.createPayout(referral.affiliateId, referral.id, commission);
        console.log(`Created ${key} payout for referral ${referral.id}: $${commission.amount}`);
        
        // Update milestone flags if needed
        await this.updateMilestoneFlags(referral.id, commission.milestoneName);
      }
    }
  }
  
  /**
   * Process bulk referral bonuses for all affiliates
   */
  async processBulkReferralBonuses(): Promise<void> {
    // Get all affiliate profiles
    const affiliates = await storage.getAllAffiliateProfiles();
    
    for (const affiliate of affiliates) {
      // Calculate bulk referral bonus
      const bulkBonus = await this.calculateBulkReferralBonus(affiliate.id);
      
      if (bulkBonus) {
        // Get first active referral to associate the bonus with
        const referrals = await storage.getMerchantReferralsByAffiliateId(affiliate.id);
        const activeReferral = referrals.find(r => r.status === 'active');
        
        if (activeReferral) {
          const payout = await this.createPayout(affiliate.id, activeReferral.id, bulkBonus);
          console.log(`Created bulk referral bonus for affiliate ${affiliate.id}: $${bulkBonus.amount}`);
        }
      }
    }
  }
  
  /**
   * Process all referrals for commission calculations
   * This would typically be run daily via a scheduled job
   */
  async processAllReferrals(): Promise<void> {
    // Get all active referrals
    const activeReferrals = await storage.getMerchantReferralsByStatus('active');
    
    for (const referral of activeReferrals) {
      await this.processReferral(referral);
    }
    
    // Process bulk referral bonuses after individual referrals
    await this.processBulkReferralBonuses();
  }
  
  /**
   * Process clawback for early cancellations
   * If customer cancels before day 30 and less than $2,500 processed,
   * the 7-day payout of $25 is clawed back
   */
  async processClawbacks(): Promise<void> {
    // Get all churned referrals
    const churnedReferrals = await storage.getMerchantReferralsByStatus('churned');
    
    for (const referral of churnedReferrals) {
      // Check if the merchant churned before 30 days
      const activationDate = referral.activationDate;
      const churnDate = referral.churnDate;
      
      if (!activationDate || !churnDate) continue;
      
      const daysBetween = Math.floor((churnDate.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysBetween < 30) {
        // Check if transaction volume was less than $2,500
        const volume = new Decimal(referral.transactionVolume30Days || 0);
        
        if (volume.lessThan(2500)) {
          // Find the 7-day payout to claw back
          const payouts = await storage.getAffiliatePayoutsByReferralId(referral.id);
          const sevenDayPayout = payouts.find(p => p.milestoneName === 'seven_day' && p.status !== 'clawed_back');
          
          if (sevenDayPayout) {
            // Claw back the payout
            await storage.markAffiliatePayoutAsClawedBack(sevenDayPayout.id, 
              `Clawed back due to early cancellation (${daysBetween} days) with insufficient volume ($${volume})`
            );
            
            // Update affiliate stats
            const affiliate = await storage.getAffiliateProfile(referral.affiliateId);
            if (affiliate) {
              const currentPending = new Decimal(affiliate.pendingPayouts || 0);
              const currentTotal = new Decimal(affiliate.totalEarned || 0);
              
              // If the payout was already paid (not just pending)
              if (sevenDayPayout.status === 'paid') {
                const newTotal = currentTotal.minus(sevenDayPayout.amount).toString();
                await storage.updateAffiliateStats(
                  affiliate.id,
                  newTotal,
                  undefined,
                  undefined,
                  undefined
                );
              } else {
                // If the payout was still pending
                const newPending = currentPending.minus(sevenDayPayout.amount).toString();
                await storage.updateAffiliateStats(
                  affiliate.id,
                  undefined,
                  newPending,
                  undefined,
                  undefined
                );
              }
            }
            
            console.log(`Clawed back payout ${sevenDayPayout.id} for referral ${referral.id}`);
          }
        }
      }
    }
  }
}

export const affiliateCommissionService = new AffiliateCommissionService();