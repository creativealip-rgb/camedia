import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: Request) {
    try {
        const { url } = await request.json()

        if (!url) {
            return NextResponse.json(
                { success: false, error: 'URL is required' },
                { status: 400 }
            )
        }

        // Fetch HTML with browser-like headers
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            next: { revalidate: 300 } // Cache for 5 mins
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        // Extract Metadata
        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || ''
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || ''
        const image = $('meta[property="og:image"]').attr('content') || ''
        const siteName = $('meta[property="og:site_name"]').attr('content') || ''
        const publishedTime = $('meta[property="article:published_time"]').attr('content') || new Date().toISOString()

        // Extract Content (Smart Heuristics)
        // Remove unwanted elements
        $('script, style, nav, header, footer, aside, .ad, .advertisement, .social-share, .comments, .sidebar').remove()

        // Try to find the main article body
        let content = ''
        const selectors = [
            'article',
            '[role="main"]',
            '.post-content',
            '.article-content',
            '.entry-content',
            'main',
            '#content',
            '.content'
        ]

        for (const selector of selectors) {
            if ($(selector).length > 0) {
                // Get text but preserve some structure if needed, for now just text
                // Better: Get HTML and clean it, or just getting text paragraphs
                content = $(selector).find('p').map((i, el) => $(el).text()).get().join('\n\n')
                if (content.length > 200) break // Found substantial content
            }
        }

        // Fallback: Body text if no selector matched
        if (!content) {
            content = $('body').find('p').map((i, el) => $(el).text()).get().join('\n\n')
        }

        return NextResponse.json({
            success: true,
            data: {
                title: title.trim(),
                excerpt: description.trim(),
                content: content.trim(),
                url: url,
                siteName: siteName,
                image: image,
                publishedAt: publishedTime,
                source: 'scraper'
            }
        })

    } catch (error: any) {
        console.error('Scraper Error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to scrape URL' },
            { status: 500 }
        )
    }
}
