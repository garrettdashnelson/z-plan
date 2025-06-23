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
    cached: boolean;
}

// In-memory cache
let cache: {
    timestamp: number;
    data: NotionResponse | null;
} = {
    timestamp: 0,
    data: null
};

const CACHE_TTL_MS = 120 * 1000; // 2 minutes


export const handler: Handler = async (event, context) => {
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

    const now = Date.now();

    // Return cached data if valid
    if (cache.data && now - cache.timestamp < CACHE_TTL_MS) {
        return {
            statusCode: 200,
            body: JSON.stringify(cache.data)
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

        cache = {
            timestamp: now,
            data: data
        };

        // Set CORS headers for browser access
        const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: data.results,
                next_cursor: data.next_cursor,
                has_more: data.has_more,
                total_results: data.results.length
            })
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