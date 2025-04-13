/**
 * Affiliate API Routes
 * 
 * This module defines the routes for the affiliate marketing system:
 * - Affiliate profile management
 * - Referral tracking
 * - Commission and payout reporting
 * - Microsite configuration
 */

import express from 'express';
import { affiliateService } from './affiliate-service';

export function setupAffiliateRoutes(app: express.Express) {
  // Get affiliate profile
  app.get('/api/affiliates/profile', async (req, res) => {
    try {
      // In a real implementation, use req.user.id from authenticated session
      const testUserId = req.headers['x-test-mode'] ? 1 : null;
      
      if (!testUserId && !req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const userId = testUserId || req.user?.id;
      const profile = await affiliateService.getAffiliateProfile(Number(userId));
      
      if (!profile) {
        return res.status(404).json({ error: 'Affiliate profile not found' });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error getting affiliate profile:', error);
      res.status(500).json({ error: 'Failed to get affiliate profile' });
    }
  });
  
  // Update affiliate profile
  app.put('/api/affiliates/profile', async (req, res) => {
    try {
      // In a real implementation, use req.user.id from authenticated session
      const testUserId = req.headers['x-test-mode'] ? 1 : null;
      
      if (!testUserId && !req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const userId = testUserId || req.user?.id;
      const profile = await affiliateService.getAffiliateProfile(Number(userId));
      
      if (!profile) {
        return res.status(404).json({ error: 'Affiliate profile not found' });
      }
      
      const updatedProfile = await affiliateService.updateAffiliateProfile(profile.id, req.body);
      res.json(updatedProfile);
    } catch (error) {
      console.error('Error updating affiliate profile:', error);
      res.status(500).json({ error: 'Failed to update affiliate profile' });
    }
  });
  
  // Get affiliate referrals
  app.get('/api/affiliates/referrals', async (req, res) => {
    try {
      // In a real implementation, use req.user.id from authenticated session
      const testUserId = req.headers['x-test-mode'] ? 1 : null;
      
      if (!testUserId && !req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const userId = testUserId || req.user?.id;
      const profile = await affiliateService.getAffiliateProfile(Number(userId));
      
      if (!profile) {
        return res.status(404).json({ error: 'Affiliate profile not found' });
      }
      
      const referrals = await affiliateService.getAffiliateReferrals(profile.id);
      res.json(referrals);
    } catch (error) {
      console.error('Error getting affiliate referrals:', error);
      res.status(500).json({ error: 'Failed to get affiliate referrals' });
    }
  });
  
  // Track affiliate referral
  app.get('/api/affiliates/track', async (req, res) => {
    try {
      const { ref, utm_source, utm_medium, utm_campaign } = req.query;
      
      if (!ref) {
        return res.status(400).json({ error: 'Missing referral code' });
      }
      
      // Get the affiliate ID from the referral code
      const refCode = ref as string;
      const profile = await db.execute(
        'SELECT * FROM affiliate_profiles WHERE affiliate_code = $1',
        [refCode]
      );
      
      if (!profile.rows[0]) {
        return res.status(404).json({ error: 'Invalid referral code' });
      }
      
      // Track the referral
      const referralData = {
        affiliate_id: profile.rows[0].id,
        referral_code: refCode,
        utm_source: utm_source as string || null,
        utm_medium: utm_medium as string || null,
        utm_campaign: utm_campaign as string || null,
        landing_page: req.headers.referer || null,
        referrer_url: req.headers.referer || null,
        ip_address: req.ip || null,
        user_agent: req.headers['user-agent'] || null,
        device_type: detectDeviceType(req.headers['user-agent'] as string || '')
      };
      
      const referral = await affiliateService.trackReferral(referralData);
      
      // Return success without exposing details (for security)
      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking referral:', error);
      res.status(500).json({ error: 'Failed to track referral' });
    }
  });
  
  // Get affiliate commissions
  app.get('/api/affiliates/commissions', async (req, res) => {
    try {
      // In a real implementation, use req.user.id from authenticated session
      const testUserId = req.headers['x-test-mode'] ? 1 : null;
      
      if (!testUserId && !req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const userId = testUserId || req.user?.id;
      const profile = await affiliateService.getAffiliateProfile(Number(userId));
      
      if (!profile) {
        return res.status(404).json({ error: 'Affiliate profile not found' });
      }
      
      const commissions = await affiliateService.getAffiliateCommissions(profile.id);
      res.json(commissions);
    } catch (error) {
      console.error('Error getting affiliate commissions:', error);
      res.status(500).json({ error: 'Failed to get affiliate commissions' });
    }
  });
  
  // Get affiliate payouts
  app.get('/api/affiliates/payouts', async (req, res) => {
    try {
      // In a real implementation, use req.user.id from authenticated session
      const testUserId = req.headers['x-test-mode'] ? 1 : null;
      
      if (!testUserId && !req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const userId = testUserId || req.user?.id;
      const profile = await affiliateService.getAffiliateProfile(Number(userId));
      
      if (!profile) {
        return res.status(404).json({ error: 'Affiliate profile not found' });
      }
      
      const payouts = await affiliateService.getAffiliatePayouts(profile.id);
      res.json(payouts);
    } catch (error) {
      console.error('Error getting affiliate payouts:', error);
      res.status(500).json({ error: 'Failed to get affiliate payouts' });
    }
  });
  
  // Get affiliate microsite by subdomain
  app.get('/api/microsites/affiliate/:subdomain', async (req, res) => {
    try {
      const { subdomain } = req.params;
      
      const affiliate = await affiliateService.getAffiliateBySubdomain(subdomain);
      
      if (!affiliate) {
        return res.status(404).json({ error: 'Affiliate microsite not found' });
      }
      
      // Return public affiliate information suitable for a microsite
      res.json({
        id: affiliate.id,
        company_name: affiliate.company_name,
        profile_photo: affiliate.profile_photo,
        profile_bio: affiliate.profile_bio || '',
        website: affiliate.website,
        microsite: {
          // Normally we would get this from affiliate's microsite settings
          theme: 'default',
          customLogo: affiliate.profile_photo,
          customColors: { primary: '#FF5500', secondary: '#0055FF' }
        }
      });
    } catch (error) {
      console.error('Error fetching affiliate microsite:', error);
      res.status(500).json({ error: 'Failed to fetch affiliate microsite' });
    }
  });
  
  // Update affiliate microsite settings
  app.put('/api/affiliates/microsite-settings', async (req, res) => {
    try {
      // In a real implementation, use req.user.id from authenticated session
      const testUserId = req.headers['x-test-mode'] ? 1 : null;
      
      if (!testUserId && !req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const userId = testUserId || req.user?.id;
      const profile = await affiliateService.getAffiliateProfile(Number(userId));
      
      if (!profile) {
        return res.status(404).json({ error: 'Affiliate profile not found' });
      }
      
      const settings = await affiliateService.updateMicrositeSettings(profile.id, req.body);
      res.json(settings);
    } catch (error) {
      console.error('Error updating microsite settings:', error);
      res.status(500).json({ error: 'Failed to update microsite settings' });
    }
  });
}

// Helper function to detect device type from user agent
function detectDeviceType(userAgent: string): string {
  if (!userAgent) return 'unknown';
  
  userAgent = userAgent.toLowerCase();
  
  if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
    return 'mobile';
  } else if (userAgent.includes('ipad') || userAgent.includes('tablet')) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

import { db } from '../db';