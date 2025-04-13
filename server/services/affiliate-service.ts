/**
 * Affiliate Marketing Service
 * 
 * This service handles all affiliate marketing operations including:
 * - Affiliate registration and profile management
 * - Referral tracking and attribution
 * - Commission calculations and payouts
 * - Affiliate microsites and marketing materials
 */

import { db } from '../db';
import { SQL } from '@neondatabase/serverless';
import { ioltaTrustAccounts } from '../../shared/schema-legal';

export class AffiliateService {
  /**
   * Get an affiliate profile by user ID
   */
  async getAffiliateProfile(userId: number) {
    try {
      const result = await db.execute(
        'SELECT * FROM affiliate_profiles WHERE user_id = $1',
        [userId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting affiliate profile:', error);
      throw new Error('Failed to get affiliate profile');
    }
  }
  
  /**
   * Get an affiliate profile by affiliate ID
   */
  async getAffiliateById(affiliateId: number) {
    try {
      const result = await db.execute(
        'SELECT * FROM affiliate_profiles WHERE id = $1',
        [affiliateId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting affiliate by ID:', error);
      throw new Error('Failed to get affiliate by ID');
    }
  }
  
  /**
   * Update an affiliate profile
   */
  async updateAffiliateProfile(affiliateId: number, profileData: any) {
    try {
      // Create SQL SET clauses and parameters dynamically
      const setClauses = [];
      const params = [];
      let paramIndex = 1;
      
      for (const [key, value] of Object.entries(profileData)) {
        if (value !== undefined) {
          setClauses.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      }
      
      if (setClauses.length === 0) {
        return null; // Nothing to update
      }
      
      params.push(affiliateId);
      
      const query = `
        UPDATE affiliate_profiles
        SET ${setClauses.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      
      const result = await db.execute(query, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating affiliate profile:', error);
      throw new Error('Failed to update affiliate profile');
    }
  }
  
  /**
   * Get referrals for an affiliate
   */
  async getAffiliateReferrals(affiliateId: number) {
    try {
      const result = await db.execute(
        'SELECT * FROM affiliate_referral_tracking WHERE affiliate_id = $1 ORDER BY created_at DESC',
        [affiliateId]
      );
      
      return result.rows || [];
    } catch (error) {
      console.error('Error getting affiliate referrals:', error);
      throw new Error('Failed to get affiliate referrals');
    }
  }
  
  /**
   * Track a referral from an affiliate
   */
  async trackReferral(referralData: any) {
    try {
      const {
        affiliate_id,
        referral_code,
        utm_source,
        utm_medium,
        utm_campaign,
        landing_page,
        referrer_url,
        ip_address,
        user_agent,
        device_type
      } = referralData;
      
      const result = await db.execute(`
        INSERT INTO affiliate_referral_tracking (
          affiliate_id, referral_code, utm_source, utm_medium, utm_campaign,
          landing_page, referrer_url, ip_address, user_agent, device_type, 
          visit_date, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        RETURNING *
      `, [
        affiliate_id, referral_code, utm_source, utm_medium, utm_campaign,
        landing_page, referrer_url, ip_address, user_agent, device_type
      ]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error tracking referral:', error);
      throw new Error('Failed to track referral');
    }
  }
  
  /**
   * Get commissions for an affiliate
   */
  async getAffiliateCommissions(affiliateId: number) {
    try {
      const result = await db.execute(
        'SELECT * FROM affiliate_commissions WHERE affiliate_id = $1 ORDER BY created_at DESC',
        [affiliateId]
      );
      
      return result.rows || [];
    } catch (error) {
      console.error('Error getting affiliate commissions:', error);
      throw new Error('Failed to get affiliate commissions');
    }
  }
  
  /**
   * Get payouts for an affiliate
   */
  async getAffiliatePayouts(affiliateId: number) {
    try {
      const result = await db.execute(
        'SELECT * FROM affiliate_payouts WHERE affiliate_id = $1 ORDER BY created_at DESC',
        [affiliateId]
      );
      
      return result.rows || [];
    } catch (error) {
      console.error('Error getting affiliate payouts:', error);
      throw new Error('Failed to get affiliate payouts');
    }
  }
  
  /**
   * Get affiliate by subdomain
   */
  async getAffiliateBySubdomain(subdomain: string) {
    try {
      // Check if the affiliate exists
      const result = await db.execute(
        'SELECT * FROM affiliate_profiles WHERE affiliate_code = $1',
        [subdomain]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting affiliate by subdomain:', error);
      throw new Error('Failed to get affiliate by subdomain');
    }
  }
  
  /**
   * Update affiliate microsite settings
   */
  async updateMicrositeSettings(affiliateId: number, settings: any) {
    try {
      const {
        subdomain,
        theme,
        customLogo,
        customColors
      } = settings;
      
      // First check if we have a microsite settings record for this affiliate
      const existingResult = await db.execute(
        'SELECT * FROM merchant_microsite_settings WHERE affiliate_id = $1',
        [affiliateId]
      );
      
      if (existingResult.rows.length > 0) {
        // Update existing record
        const updateResult = await db.execute(`
          UPDATE merchant_microsite_settings
          SET subdomain = $1, theme = $2, custom_logo = $3, custom_colors = $4, updated_at = NOW()
          WHERE affiliate_id = $5
          RETURNING *
        `, [subdomain, theme, customLogo, JSON.stringify(customColors), affiliateId]);
        
        return updateResult.rows[0] || null;
      } else {
        // Create new record
        const insertResult = await db.execute(`
          INSERT INTO merchant_microsite_settings (
            affiliate_id, subdomain, theme, custom_logo, custom_colors, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING *
        `, [affiliateId, subdomain, theme, customLogo, JSON.stringify(customColors)]);
        
        return insertResult.rows[0] || null;
      }
    } catch (error) {
      console.error('Error updating microsite settings:', error);
      throw new Error('Failed to update microsite settings');
    }
  }
}

// Export a singleton instance of the service
export const affiliateService = new AffiliateService();