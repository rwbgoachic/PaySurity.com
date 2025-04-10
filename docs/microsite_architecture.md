# PaySurity Microsite Architecture

## Overview

PaySurity's microsite architecture enables merchants, affiliates, and ISO partners to have branded subdomain websites within the PaySurity ecosystem. This provides a flexible solution that allows merchants to either use a PaySurity-hosted microsite or integrate PaySurity services into their existing website.

## Design Principles

The microsite architecture is built on these key principles:

1. **Subdomain Isolation**: Each merchant, affiliate, or ISO partner gets their own subdomain
2. **Consistent Branding**: Core PaySurity features remain consistent across all microsites
3. **Customization Options**: Each microsite can be customized with branding elements
4. **Responsive Design**: All microsites are fully responsive for all device types
5. **Unified Backend**: All microsites access the same core API endpoints
6. **Secure Integration**: Each microsite operates within the PaySurity security framework

## Subdomain Structure

The system uses a consistent naming pattern for subdomains:

- **Merchant Microsites**: `[merchant-name].paysurity.com`
- **Affiliate Microsites**: `[affiliate-name].paysurity.com`
- **ISO Partner Microsites**: `[iso-name].paysurity.com`

## Technical Implementation

### Database Schema

The subdomain functionality is implemented in these database tables:

#### Merchant Profiles Table

```sql
CREATE TABLE merchant_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  tax_id TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'USA',
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  referral_code TEXT,
  subdomain TEXT UNIQUE,
  use_microsite BOOLEAN DEFAULT FALSE,
  integration_code TEXT,
  profile_photo TEXT,
  profile_bio TEXT,
  custom_colors JSONB,
  status TEXT NOT NULL DEFAULT 'pending'
);
```

#### Affiliate Profiles Table

```sql
CREATE TABLE affiliate_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website_url TEXT,
  referral_code TEXT UNIQUE,
  subdomain TEXT UNIQUE,
  profile_photo TEXT,
  profile_bio TEXT,
  social_media_links JSONB,
  marketing_specialty TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### ISO Partner Table

```sql
CREATE TABLE iso_partners (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  territory TEXT,
  subdomain TEXT UNIQUE,
  profile_photo TEXT,
  profile_bio TEXT,
  merchant_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

### API Endpoints

The following API endpoints facilitate the microsite functionality:

#### Merchant Microsite Endpoints

- `GET /api/microsites/merchant/:subdomain`: Retrieves merchant profile by subdomain
- `POST /api/merchants/:id/microsite`: Enables/disables microsite for a merchant
- `PUT /api/merchants/:id/subdomain`: Updates subdomain for a merchant
- `GET /api/microsites/merchant/:subdomain/products`: Retrieves merchant's products (if applicable)
- `GET /api/microsites/merchant/:subdomain/services`: Retrieves merchant's services (if applicable)

#### Affiliate Microsite Endpoints

- `GET /api/microsites/affiliate/:subdomain`: Retrieves affiliate profile by subdomain
- `POST /api/affiliates/:id/microsite`: Enables/disables microsite for an affiliate
- `PUT /api/affiliates/:id/subdomain`: Updates subdomain for an affiliate
- `GET /api/microsites/affiliate/:subdomain/referral`: Creates referral tracking link

#### ISO Partner Microsite Endpoints

- `GET /api/microsites/iso/:subdomain`: Retrieves ISO partner profile by subdomain
- `POST /api/iso/:id/microsite`: Enables/disables microsite for an ISO partner
- `PUT /api/iso/:id/subdomain`: Updates subdomain for an ISO partner
- `GET /api/microsites/iso/:subdomain/merchants`: Retrieves ISO partner's merchants

### Backend Implementation

In `storage.ts`, microsite functionality is implemented through these methods:

```typescript
// Merchant microsite functions
async getMerchantProfileBySubdomain(subdomain: string): Promise<MerchantProfile | undefined> {
  const [profile] = await db.select().from(merchantProfiles).where(eq(merchantProfiles.subdomain, subdomain));
  return profile;
}

async updateMerchantMicrositeStatus(id: number, useMicrosite: boolean): Promise<MerchantProfile> {
  const [profile] = await db
    .update(merchantProfiles)
    .set({
      useMicrosite,
      updatedAt: new Date()
    })
    .where(eq(merchantProfiles.id, id))
    .returning();
  
  if (!profile) {
    throw new Error(`Merchant profile with id ${id} not found`);
  }
  
  return profile;
}

async updateMerchantSubdomain(id: number, subdomain: string): Promise<MerchantProfile> {
  // Check if subdomain already exists
  const existing = await this.getMerchantProfileBySubdomain(subdomain);
  if (existing && existing.id !== id) {
    throw new Error(`Subdomain ${subdomain} is already in use`);
  }
  
  const [profile] = await db
    .update(merchantProfiles)
    .set({
      subdomain,
      updatedAt: new Date()
    })
    .where(eq(merchantProfiles.id, id))
    .returning();
  
  if (!profile) {
    throw new Error(`Merchant profile with id ${id} not found`);
  }
  
  return profile;
}

// Similar functions for affiliate and ISO partner microsites
```

### Frontend Implementation

The frontend implements dynamic microsite rendering based on subdomain:

```typescript
// Simplified example of microsite routing
export function MicrositeRouter() {
  const { hostname } = window.location;
  const subdomain = hostname.split('.')[0];
  
  // Check if we're on the main domain or a subdomain
  if (hostname === 'paysurity.com' || hostname === 'www.paysurity.com') {
    return <MainSiteRouter />;
  }
  
  // Determine the type of microsite
  return (
    <Suspense fallback={<MicrositeSkeleton />}>
      <Switch>
        <Route path="/merchant/:subdomain" component={MerchantMicrosite} />
        <Route path="/affiliate/:subdomain" component={AffiliateMicrosite} />
        <Route path="/iso/:subdomain" component={IsoPartnerMicrosite} />
        <Route component={MicrositeNotFound} />
      </Switch>
    </Suspense>
  );
}
```

## Microsite Customization

### Visual Customization

Merchants, affiliates, and ISO partners can customize:

- Logo
- Color scheme (primary, secondary, accent colors)
- Typography (from available options)
- Header image
- Profile photo

### Content Customization

Customizable content includes:

- Business description/bio
- Service descriptions
- Contact information
- Social media links
- Testimonials (moderated)

### Integration Options

For merchants who prefer to use their existing website:

1. **JavaScript Integration**: Code snippet for embedding PaySurity payment functionality
2. **API Integration**: Direct API access for custom integrations
3. **iFrame Integration**: Embedded payment forms

## DNS Configuration

The subdomain architecture requires specific DNS configuration:

1. **Wildcard DNS Record**: `*.paysurity.com` points to the application server
2. **A Records**: Individual A records for specific high-traffic microsites
3. **CNAME Validation**: System validates subdomain availability before assignment

## Security Considerations

### Domain Security

- Each subdomain is protected by the same SSL certificate (wildcard)
- Content Security Policy (CSP) headers prevent cross-site scripting
- Regular security scans check for subdomain vulnerabilities

### Authentication

- Merchants access their microsite admin through the main dashboard
- Customer-facing microsite pages have public and authenticated sections
- API endpoints validate subdomain ownership before returning sensitive data

### Data Isolation

- Microsite data is logically separated in the database
- Client-side rendering prevents data leakage between microsites
- API rate limiting prevents abuse of the microsite system

## Future Enhancements

Planned improvements for the microsite architecture:

1. **Custom Domain Support**: Allow partners to use their own domains instead of subdomains
2. **Advanced Theme Editor**: Provide a visual theme editor for microsites
3. **SEO Optimization**: Enhanced metadata and indexing for microsites
4. **Content Versioning**: Allow saving and reverting microsite content changes
5. **A/B Testing**: Built-in testing for microsite conversion optimization