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
import { ioltaTrustAccounts } from '../../shared/schema-legal';
import { sqlService } from './sql-service';

export class AffiliateService {
  /**
   * Get an affiliate profile by user ID
   */
  async getAffiliateProfile(userId: number) {
    try {
      if (!userId) {
        return null;
      }
      
      // First check if the table exists to avoid SQL errors
      const tableCheckResult = await sqlService.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'affiliate_profiles'
        );
      `);
      
      const tableExists = tableCheckResult.rows[0]?.exists;
      if (!tableExists) {
        console.log('Table affiliate_profiles does not exist');
        return null;
      }
      
      // Check if the affiliate exists - use parameterized query with user_id
      const result = await sqlService.parameterizedSQL(
        'SELECT * FROM affiliate_profiles WHERE user_id = $1',
        [userId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting affiliate profile:', error);
      // Return null instead of throwing error for more graceful handling
      return null;
    }
  }
  
  /**
   * Get an affiliate profile by affiliate ID
   */
  async getAffiliateById(affiliateId: number) {
    try {
      if (!affiliateId) {
        return null;
      }

      // First check if the table exists to avoid SQL errors
      const tableCheckResult = await sqlService.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'affiliate_profiles'
        );
      `);
      
      const tableExists = tableCheckResult.rows[0]?.exists;
      if (!tableExists) {
        console.log('Table affiliate_profiles does not exist');
        return null;
      }
      
      const result = await sqlService.parameterizedSQL(
        'SELECT * FROM affiliate_profiles WHERE id = $1',
        [affiliateId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting affiliate by ID:', error);
      // Return null instead of throwing error for more graceful handling
      return null;
    }
  }
  
  /**
   * Update an affiliate profile
   */
  async updateAffiliateProfile(affiliateId: number, profileData: any) {
    try {
      if (!affiliateId) {
        console.log('No affiliate ID provided');
        return null;
      }
      
      // First check if the table exists to avoid SQL errors
      const tableCheckResult = await sqlService.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'affiliate_profiles'
        );
      `);
      
      const tableExists = tableCheckResult.rows[0]?.exists;
      if (!tableExists) {
        console.log('Table affiliate_profiles does not exist');
        return null;
      }
      
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
      
      const result = await sqlService.parameterizedSQL(query, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating affiliate profile:', error);
      // Return null instead of throwing error for more graceful handling
      return null;
    }
  }
  
  /**
   * Get referrals for an affiliate
   */
  async getAffiliateReferrals(affiliateId: number) {
    try {
      if (!affiliateId) {
        return [];
      }
      
      // First check if the table exists to avoid SQL errors
      const tableCheckResult = await sqlService.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'affiliate_referral_tracking'
        );
      `);
      
      const tableExists = tableCheckResult.rows[0]?.exists;
      if (!tableExists) {
        console.log('Table affiliate_referral_tracking does not exist');
        return [];
      }
      
      const result = await sqlService.parameterizedSQL(
        'SELECT * FROM affiliate_referral_tracking WHERE affiliate_id = $1 ORDER BY created_at DESC',
        [affiliateId]
      );
      
      return result.rows || [];
    } catch (error) {
      console.error('Error getting affiliate referrals:', error);
      // Return empty array instead of throwing error for more graceful handling
      return [];
    }
  }
  
  /**
   * Track a referral from an affiliate
   */
  async trackReferral(referralData: any) {
    try {
      if (!referralData || !referralData.affiliate_id) {
        console.log('Invalid referral data provided');
        return null;
      }

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
      
      // First check if the table exists to avoid SQL errors
      const tableCheckResult = await sqlService.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'affiliate_referral_tracking'
        );
      `);
      
      const tableExists = tableCheckResult.rows[0]?.exists;
      if (!tableExists) {
        console.log('Table affiliate_referral_tracking does not exist, attempting to create it');
        try {
          // Create the table if it doesn't exist
          await sqlService.query(`
            CREATE TABLE IF NOT EXISTS affiliate_referral_tracking (
              id SERIAL PRIMARY KEY,
              affiliate_id INTEGER NOT NULL,
              referral_code TEXT,
              utm_source TEXT,
              utm_medium TEXT,
              utm_campaign TEXT,
              landing_page TEXT,
              referrer_url TEXT,
              ip_address TEXT,
              user_agent TEXT,
              device_type TEXT,
              visit_date TIMESTAMP DEFAULT NOW(),
              created_at TIMESTAMP DEFAULT NOW(),
              converted_merchant_id INTEGER,
              converted_at TIMESTAMP
            );
          `);
          console.log('Created affiliate_referral_tracking table');
        } catch (createError) {
          console.error('Error creating affiliate_referral_tracking table:', createError);
          return null;
        }
      }
      
      const result = await sqlService.parameterizedSQL(`
        INSERT INTO affiliate_referral_tracking (
          affiliate_id, referral_code, utm_source, utm_medium, utm_campaign,
          landing_page, referrer_url, ip_address, user_agent, device_type, 
          visit_date, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        RETURNING *
      `, [
        affiliate_id, 
        referral_code || '', 
        utm_source || '', 
        utm_medium || '', 
        utm_campaign || '',
        landing_page || '', 
        referrer_url || '', 
        ip_address || '', 
        user_agent || '', 
        device_type || ''
      ]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error tracking referral:', error);
      // Return null instead of throwing error for more graceful handling
      return null;
    }
  }
  
  /**
   * Get commissions for an affiliate
   */
  async getAffiliateCommissions(affiliateId: number) {
    try {
      if (!affiliateId) {
        return [];
      }
      
      // First check if the table exists to avoid SQL errors
      const tableCheckResult = await sqlService.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'affiliate_commissions'
        );
      `);
      
      const tableExists = tableCheckResult.rows[0]?.exists;
      if (!tableExists) {
        console.log('Table affiliate_commissions does not exist');
        return [];
      }
      
      const result = await sqlService.parameterizedSQL(
        'SELECT * FROM affiliate_commissions WHERE affiliate_id = $1 ORDER BY created_at DESC',
        [affiliateId]
      );
      
      return result.rows || [];
    } catch (error) {
      console.error('Error getting affiliate commissions:', error);
      // Return empty array instead of throwing error for more graceful handling
      return [];
    }
  }
  
  /**
   * Get payouts for an affiliate
   */
  async getAffiliatePayouts(affiliateId: number) {
    try {
      if (!affiliateId) {
        return [];
      }
      
      // First check if the table exists to avoid SQL errors
      const tableCheckResult = await sqlService.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'affiliate_payouts'
        );
      `);
      
      const tableExists = tableCheckResult.rows[0]?.exists;
      if (!tableExists) {
        console.log('Table affiliate_payouts does not exist');
        return [];
      }
      
      const result = await sqlService.parameterizedSQL(
        'SELECT * FROM affiliate_payouts WHERE affiliate_id = $1 ORDER BY created_at DESC',
        [affiliateId]
      );
      
      return result.rows || [];
    } catch (error) {
      console.error('Error getting affiliate payouts:', error);
      // Return empty array instead of throwing error for more graceful handling
      return [];
    }
  }
  
  /**
   * Get affiliate by subdomain/code
   */
  async getAffiliateBySubdomain(subdomain: string) {
    try {
      if (!subdomain) {
        return null;
      }
      
      // First check if the table exists to avoid SQL errors
      const tableCheckResult = await sqlService.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'affiliate_profiles'
        );
      `);
      
      const tableExists = tableCheckResult.rows[0]?.exists;
      if (!tableExists) {
        console.log('Table affiliate_profiles does not exist');
        return null;
      }
      
      // Check if affiliate_code column exists
      const columnCheckResult = await sqlService.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'affiliate_profiles' AND column_name = 'affiliate_code'
        );
      `);
      
      const columnExists = columnCheckResult.rows[0]?.exists;
      if (!columnExists) {
        console.log('Column affiliate_code does not exist in affiliate_profiles table');
        
        // Try using subdomain column instead as fallback
        const subdomainColumnCheckResult = await sqlService.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'affiliate_profiles' AND column_name = 'subdomain'
          );
        `);
        
        const subdomainColumnExists = subdomainColumnCheckResult.rows[0]?.exists;
        if (subdomainColumnExists) {
          const result = await sqlService.parameterizedSQL(
            'SELECT * FROM affiliate_profiles WHERE subdomain = $1',
            [subdomain]
          );
          
          return result[0] || null;
        }
        
        return null;
      }
      
      // Use affiliate_code column
      const result = await sqlService.parameterizedSQL(
        'SELECT * FROM affiliate_profiles WHERE affiliate_code = $1',
        [subdomain]
      );
      
      return result[0] || null;
    } catch (error) {
      console.error('Error getting affiliate by subdomain:', error);
      // Return null instead of throwing error for more graceful handling
      return null;
    }
  }
  
  /**
   * Update affiliate microsite settings
   */
  async updateMicrositeSettings(affiliateId: number, settings: any) {
    try {
      if (!affiliateId) {
        console.log('No affiliate ID provided');
        return null;
      }
      
      const {
        subdomain,
        theme,
        customLogo,
        customColors
      } = settings;
      
      // First check if the table exists to avoid SQL errors
      const tableCheckResult = await sqlService.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'merchant_microsite_settings'
        );
      `);
      
      const tableExists = tableCheckResult.rows[0]?.exists;
      if (!tableExists) {
        console.log('Table merchant_microsite_settings does not exist, attempting to create it');
        try {
          // Create the table if it doesn't exist
          await sqlService.query(`
            CREATE TABLE IF NOT EXISTS merchant_microsite_settings (
              id SERIAL PRIMARY KEY,
              affiliate_id INTEGER NOT NULL,
              subdomain TEXT,
              theme TEXT,
              custom_logo TEXT,
              custom_colors JSONB,
              created_at TIMESTAMP DEFAULT NOW(),
              updated_at TIMESTAMP DEFAULT NOW()
            );
          `);
          console.log('Created merchant_microsite_settings table');
        } catch (createError) {
          console.error('Error creating merchant_microsite_settings table:', createError);
          return null;
        }
      }
      
      // Check if we have a microsite settings record for this affiliate
      const existingResult = await sqlService.parameterizedSQL(
        'SELECT * FROM merchant_microsite_settings WHERE affiliate_id = $1',
        [affiliateId]
      );
      
      if (existingResult && existingResult.length > 0) {
        // Update existing record
        const updateResult = await sqlService.parameterizedSQL(`
          UPDATE merchant_microsite_settings
          SET subdomain = $1, theme = $2, custom_logo = $3, custom_colors = $4, updated_at = NOW()
          WHERE affiliate_id = $5
          RETURNING *
        `, [subdomain, theme, customLogo, JSON.stringify(customColors || {}), affiliateId]);
        
        return updateResult[0] || null;
      } else {
        // Create new record
        const insertResult = await sqlService.parameterizedSQL(`
          INSERT INTO merchant_microsite_settings (
            affiliate_id, subdomain, theme, custom_logo, custom_colors, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING *
        `, [affiliateId, subdomain, theme, customLogo, JSON.stringify(customColors || {})]);
        
        return insertResult[0] || null;
      }
    } catch (error) {
      console.error('Error updating microsite settings:', error);
      // Return null instead of throwing error for more graceful handling
      return null;
    }
  }
}

// Export a singleton instance of the service
export const affiliateService = new AffiliateService();