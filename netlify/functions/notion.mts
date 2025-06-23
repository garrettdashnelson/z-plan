import type { Handler } from '@netlify/functions';

interface NotionDatabaseQuery {
    filter?: any;
    sorts?: any[];
    page_size?: number;
    start_cursor?: string;
}

interface NotionPage {
    id: string;
    created_time: string;
    last_edited_time: string;
    properties: Record<string, any>;
}

interface NotionResponse {
    object: string;
    results: NotionPage[];
    next_cursor: string | null;
    has_more: boolean;
}

interface CacheEntry {
    data: any;
    timestamp: number;
    etag: string;
}

// In-memory cache (in production, consider using Redis or similar)
const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

function generateCacheKey(query: NotionDatabaseQuery): string {
    return JSON.stringify({
        page_size: query.page_size,
        start_cursor: query.start_cursor,
        filter: query.filter,
        sorts: query.sorts
    });
}

function isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < CACHE_DURATION;
}

export const handler: Handler = async (event, context): Promise<any> => {
    const { NOTION_SECRET, NOTION_DATABASE_ID } = process.env;

    if (!NOTION_SECRET) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Missing NOTION_SECRET in environment' })
        };
    }

    if (!NOTION_DATABASE_ID) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Missing NOTION_DATABASE_ID in environment' })
        };
    }

    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            }
        };
    }

    try {
        // Parse query parameters from the request
        const queryParams = event.queryStringParameters || {};
        const pageSize = queryParams.page_size ? parseInt(queryParams.page_size) : 100;
        const startCursor = queryParams.start_cursor || undefined;

        // Build the query object
        const query: NotionDatabaseQuery = {
            page_size: pageSize
        };

        if (startCursor) {
            query.start_cursor = startCursor;
        }

        // Add filter if provided
        if (queryParams.filter) {
            try {
                query.filter = JSON.parse(queryParams.filter);
            } catch (e) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Invalid filter parameter - must be valid JSON' })
                };
            }
        }

        // Add sorts if provided
        if (queryParams.sorts) {
            try {
                query.sorts = JSON.parse(queryParams.sorts);
            } catch (e) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Invalid sorts parameter - must be valid JSON' })
                };
            }
        }

        // Generate cache key
        const cacheKey = generateCacheKey(query);
        const cachedEntry = cache.get(cacheKey);
        const clientEtag = event.headers['if-none-match'];

        // Check if we have a valid cached response
        if (cachedEntry && isCacheValid(cachedEntry)) {
            // If client has the same ETag, return 304 Not Modified
            if (clientEtag === cachedEntry.etag) {
                return {
                    statusCode: 304,
                    headers: {
                        'ETag': cachedEntry.etag,
                        'Cache-Control': 'public, max-age=900', // 15 minutes
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type, If-None-Match'
                    }
                };
            }

            // Return cached data
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'ETag': cachedEntry.etag,
                    'Cache-Control': 'public, max-age=900', // 15 minutes
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
                },
                body: JSON.stringify(cachedEntry.data)
            };
        }

        // Make request to Notion API
        const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_SECRET}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(query)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Notion API error:', response.status, errorText);
            return {
                statusCode: response.status,
                body: JSON.stringify({ 
                    error: 'Failed to query Notion database',
                    details: errorText
                })
            };
        }

        const data: NotionResponse = await response.json();

        // Prepare response data
        const responseData = {
            success: true,
            data: data.results,
            next_cursor: data.next_cursor,
            has_more: data.has_more,
            total_results: data.results.length
        };

        // Generate ETag for caching
        const etag = `"${Buffer.from(JSON.stringify(responseData)).toString('base64').slice(0, 8)}"`;

        // Cache the response
        cache.set(cacheKey, {
            data: responseData,
            timestamp: Date.now(),
            etag: etag
        });

        // Clean up old cache entries (keep only last 100 entries)
        if (cache.size > 100) {
            const entries = Array.from(cache.entries());
            entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
            const toDelete = entries.slice(100);
            toDelete.forEach(([key]) => cache.delete(key));
        }

        // Set CORS headers for browser access
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'ETag': etag,
            'Cache-Control': 'public, max-age=900', // 15 minutes
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(responseData)
        };

    } catch (err: unknown) {
        const error = err as any;
        console.error('Error querying Notion database:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message 
            })
        };
    }
}; 