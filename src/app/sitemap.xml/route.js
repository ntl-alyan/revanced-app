import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Fetch all sitemap entries
    const entries = await db.collection('sitemapentries').find({}).toArray();
    
    // Filter active entries (if you have an isActive field)
    const activeEntries = entries.filter(entry => entry.isActive !== false);
    // If you don't have isActive field, use all entries:
    // const activeEntries = entries;

    // Build the XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    for (const entry of activeEntries) {
      const lastModified = entry.lastModified 
        ? new Date(entry.lastModified).toISOString().split('T')[0] // Format as YYYY-MM-DD
        : new Date(entry.updatedAt || entry.createdAt).toISOString().split('T')[0];
      
      xml += '  <url>\n';
      xml += `    <loc>${escapeXml(entry.url)}</loc>\n`;
      xml += `    <lastmod>${lastModified}</lastmod>\n`;
      xml += `    <changefreq>${escapeXml(entry.changeFrequency || 'weekly')}</changefreq>\n`;
      xml += `    <priority>${entry.priority || 0.5}</priority>\n`;
      xml += '  </url>\n';
    }
    
    xml += '</urlset>';

    // Return XML response
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    
    // Return error as XML or plain text
    const errorXml = '<?xml version="1.0" encoding="UTF-8"?>\n<error>Failed to generate sitemap</error>';
    
    return new NextResponse(errorXml, {
      status: 500,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}

// Helper function to escape XML special characters
function escapeXml(string) {
  return string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}