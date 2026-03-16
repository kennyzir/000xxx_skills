import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { authMiddleware } from '../lib/auth';
import { validateInput } from '../lib/validation';
import { successResponse, errorResponse } from '../lib/response';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Validate input
  const validation = validateInput(req.body, {
    url: { type: 'string', required: true, min: 10, max: 2000 }
  });

  if (!validation.valid) {
    return errorResponse(res, 'Invalid input', 400, validation.errors);
  }

  const { url } = validation.data!;

  try {
    // Fetch the webpage
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Claw0x-WebScraper/1.0'
      },
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false
      })
    });

    // Parse HTML
    const $ = cheerio.load(response.data);

    // Extract structured data
    const data = {
      title: $('title').text().trim(),
      description: $('meta[name="description"]').attr('content') || '',
      headings: {
        h1: $('h1').map((_, el) => $(el).text().trim()).get(),
        h2: $('h2').map((_, el) => $(el).text().trim()).get()
      },
      links: $('a[href]').map((_, el) => ({
        text: $(el).text().trim(),
        href: $(el).attr('href')
      })).get().slice(0, 50), // Limit to 50 links
      images: $('img[src]').map((_, el) => ({
        alt: $(el).attr('alt') || '',
        src: $(el).attr('src')
      })).get().slice(0, 20), // Limit to 20 images
      paragraphs: $('p').map((_, el) => $(el).text().trim())
        .get()
        .filter(p => p.length > 20)
        .slice(0, 10) // Limit to 10 paragraphs
    };

    return successResponse(res, data);
  } catch (error: any) {
    console.error('Scraping error:', error);
    return errorResponse(
      res, 
      'Failed to scrape website', 
      500,
      error.message
    );
  }
}

export default authMiddleware(handler);
