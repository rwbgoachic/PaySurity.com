import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { Request, Response } from 'express';

/**
 * Generates a dynamic XML sitemap with all site URLs
 * This helps search engines discover and index all pages
 */
export async function generateSitemap(req: Request, res: Response) {
  try {
    // Set cache control headers for the sitemap
    res.header('Cache-Control', 'max-age=86400'); // Cache for 24 hours
    
    // Get the hostname from the request
    const hostname = req.protocol + '://' + req.get('host');
    
    // Create a sitemap stream
    const smStream = new SitemapStream({ hostname });
    
    // Define all site URLs
    const links = [
      // Core pages
      { url: '/', changefreq: 'weekly', priority: 1.0 },
      { url: '/auth', changefreq: 'monthly', priority: 0.7 },
      
      // Industry-specific pages
      { url: '/blog', changefreq: 'weekly', priority: 0.8 },
      { url: '/blog/payment-industry-news', changefreq: 'daily', priority: 0.9 },
      { url: '/blog/industry/restaurant', changefreq: 'weekly', priority: 0.8 },
      { url: '/blog/industry/legal', changefreq: 'weekly', priority: 0.8 },
      { url: '/blog/industry/healthcare', changefreq: 'weekly', priority: 0.8 },
      { url: '/blog/industry/retail', changefreq: 'weekly', priority: 0.8 },
      
      // Protected pages (for SEO awareness)
      { url: '/merchant/dashboard', changefreq: 'daily', priority: 0.5 },
      { url: '/merchant/pos/bistro', changefreq: 'monthly', priority: 0.5 },
      
      // Add other pages here as they are created
    ];
    
    // Create a readable stream from the links array
    const linkStream = Readable.from(links);
    
    // Pipe the links through the sitemap stream
    linkStream.pipe(smStream);
    
    // Convert the stream to a promise
    const sitemap = await streamToPromise(smStream);
    
    // Set content type to XML and send the sitemap
    res.header('Content-Type', 'application/xml');
    res.send(sitemap.toString());
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}