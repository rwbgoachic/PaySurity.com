import axios from 'axios';
import { storage } from '../storage';
import { User } from '@shared/schema';

const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;
const HUBSPOT_API_URL = 'https://api.hubapi.com';
const REDIRECT_URI = 'https://paysurity.com/api/hubspot/callback'; // Update with your actual domain

interface HubSpotToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
}

interface HubSpotContact {
  id?: string;
  properties: {
    email: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    company?: string;
    website?: string;
    [key: string]: any;
  };
}

interface HubSpotDeal {
  id?: string;
  properties: {
    dealname: string;
    amount?: string;
    dealstage?: string;
    pipeline?: string;
    closedate?: string;
    [key: string]: any;
  };
}

class HubSpotService {
  private tokenCache: Map<number, HubSpotToken> = new Map();
  
  /**
   * Authenticate with HubSpot and get access token
   */
  async getAuthUrl(userId: number): Promise<string> {
    const scopes = [
      'crm.objects.contacts.read',
      'crm.objects.contacts.write',
      'crm.objects.deals.read',
      'crm.objects.deals.write'
    ];
    
    return `https://app.hubspot.com/oauth/authorize?client_id=${HUBSPOT_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes.join(' '))}&state=${userId}`;
  }
  
  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, userId: number): Promise<HubSpotToken> {
    try {
      const response = await axios.post('https://api.hubapi.com/oauth/v1/token', null, {
        params: {
          grant_type: 'authorization_code',
          client_id: HUBSPOT_CLIENT_ID,
          client_secret: HUBSPOT_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          code
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const token: HubSpotToken = {
        ...response.data,
        expires_at: Date.now() + (response.data.expires_in * 1000)
      };
      
      // Store token in cache and database
      this.tokenCache.set(userId, token);
      await storage.saveHubSpotToken(userId, token);
      
      return token;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to authenticate with HubSpot');
    }
  }
  
  /**
   * Get valid token, refreshing if necessary
   */
  async getToken(userId: number): Promise<string> {
    // Try to get from cache first
    let token = this.tokenCache.get(userId);
    
    // If not in cache, try to get from database
    if (!token) {
      token = await storage.getHubSpotToken(userId);
      if (token) {
        this.tokenCache.set(userId, token);
      }
    }
    
    // If token exists but is expired, refresh it
    if (token && token.expires_at < Date.now()) {
      token = await this.refreshToken(token.refresh_token, userId);
    }
    
    // If we still don't have a token, throw error
    if (!token) {
      throw new Error('No HubSpot token found. User needs to authenticate.');
    }
    
    return token.access_token;
  }
  
  /**
   * Refresh an expired token
   */
  private async refreshToken(refreshToken: string, userId: number): Promise<HubSpotToken> {
    try {
      const response = await axios.post('https://api.hubapi.com/oauth/v1/token', null, {
        params: {
          grant_type: 'refresh_token',
          client_id: HUBSPOT_CLIENT_ID,
          client_secret: HUBSPOT_CLIENT_SECRET,
          refresh_token: refreshToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const token: HubSpotToken = {
        ...response.data,
        expires_at: Date.now() + (response.data.expires_in * 1000)
      };
      
      // Store updated token
      this.tokenCache.set(userId, token);
      await storage.saveHubSpotToken(userId, token);
      
      return token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh HubSpot token');
    }
  }
  
  /**
   * Create or update a contact in HubSpot
   */
  async createOrUpdateContact(userId: number, contact: HubSpotContact): Promise<HubSpotContact> {
    try {
      const token = await this.getToken(userId);
      
      // Check if contact exists by email
      const existingContact = await this.findContactByEmail(userId, contact.properties.email);
      
      if (existingContact) {
        // Update existing contact
        const response = await axios.patch(
          `${HUBSPOT_API_URL}/crm/v3/objects/contacts/${existingContact.id}`,
          { properties: contact.properties },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } else {
        // Create new contact
        const response = await axios.post(
          `${HUBSPOT_API_URL}/crm/v3/objects/contacts`,
          { properties: contact.properties },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      }
    } catch (error) {
      console.error('Error creating/updating contact:', error);
      throw new Error('Failed to create or update contact in HubSpot');
    }
  }
  
  /**
   * Find a contact by email
   */
  async findContactByEmail(userId: number, email: string): Promise<HubSpotContact | null> {
    try {
      const token = await this.getToken(userId);
      
      const response = await axios.post(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts/search`,
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: email
                }
              ]
            }
          ]
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error finding contact:', error);
      return null;
    }
  }
  
  /**
   * Create a deal in HubSpot
   */
  async createDeal(userId: number, deal: HubSpotDeal, contactId?: string): Promise<HubSpotDeal> {
    try {
      const token = await this.getToken(userId);
      
      // Create the deal
      const response = await axios.post(
        `${HUBSPOT_API_URL}/crm/v3/objects/deals`,
        { properties: deal.properties },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const createdDeal = response.data;
      
      // If contactId is provided, associate the deal with the contact
      if (contactId) {
        await axios.put(
          `${HUBSPOT_API_URL}/crm/v3/objects/deals/${createdDeal.id}/associations/contacts/${contactId}/deal_to_contact`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      return createdDeal;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw new Error('Failed to create deal in HubSpot');
    }
  }
  
  /**
   * Sync a merchant user to HubSpot as a contact
   */
  async syncMerchantToHubSpot(userId: number, merchant: User): Promise<void> {
    // Get merchant profile if available
    let merchantProfile;
    try {
      merchantProfile = await storage.getMerchantProfileByUserId(merchant.id);
    } catch (error) {
      console.log('No merchant profile found for user');
    }
    
    // Create or update the contact
    const contact: HubSpotContact = {
      properties: {
        email: merchant.email || '',
        firstname: merchant.firstName || '',
        lastname: merchant.lastName || '',
        // Use merchant profile data if available, otherwise use defaults
        phone: merchantProfile?.phone || '',
        company: merchantProfile?.businessName || '',
        website: merchantProfile?.website || '',
        // Add any other properties as needed
      }
    };
    
    await this.createOrUpdateContact(userId, contact);
  }
  
  /**
   * Sync a merchant application to HubSpot as a deal
   */
  async syncApplicationToHubSpot(userId: number, application: any): Promise<void> {
    // Find or create the contact
    const contact = await this.findContactByEmail(userId, application.email);
    
    let contactId: string | undefined;
    if (contact) {
      contactId = contact.id;
    } else {
      const newContact = await this.createOrUpdateContact(userId, {
        properties: {
          email: application.email,
          firstname: application.firstName,
          lastname: application.lastName,
          phone: application.phone,
          company: application.businessName
        }
      });
      contactId = newContact.id;
    }
    
    // Create the deal
    const deal: HubSpotDeal = {
      properties: {
        dealname: `${application.businessName} Application`,
        amount: application.expectedMonthlyVolume?.toString() || '0',
        dealstage: this.mapStatusToDealStage(application.status),
        pipeline: 'default',
        closedate: this.getCloseDate(30) // 30 days from now
      }
    };
    
    await this.createDeal(userId, deal, contactId);
  }
  
  /**
   * Map application status to HubSpot deal stage
   */
  private mapStatusToDealStage(status: string): string {
    switch (status) {
      case 'pending':
        return 'qualificationstage';
      case 'approved':
        return 'closedwon';
      case 'rejected':
        return 'closedlost';
      case 'review':
        return 'decisionmakerboughtin';
      default:
        return 'appointmentscheduled';
    }
  }
  
  /**
   * Get a formatted date for X days in the future
   */
  private getCloseDate(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.getTime().toString();
  }
}

export const hubspotService = new HubSpotService();