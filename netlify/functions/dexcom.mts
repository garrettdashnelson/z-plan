import axios from 'axios';
import type { Handler } from '@netlify/functions';

interface GlucoseReading {
    Value: number;
    Trend: number;
    WT: string;
}

interface DexcomResponse {
    value: number;
    trend: number;
    trendDescription: string;
    trendDescriptionUnicode: string;
    timestamp: string;
    parsedTimestamp: string;
    cached: boolean;
}

// In-memory cache
let cache: {
    timestamp: number;
    data: DexcomResponse | null;
} = {
    timestamp: 0,
    data: null
};

const CACHE_TTL_MS = 120 * 1000; // 2 minutes
const APPLICATION_ID = 'd89443d2-327c-4a6f-89e5-496bbb0317db';
const BASE_URL = 'https://share2.dexcom.com/ShareWebServices/Services';

export const handler: Handler = async (event, context) => {
    const { DEXCOM_USERNAME, DEXCOM_PASSWORD } = process.env;

    if (!DEXCOM_USERNAME || !DEXCOM_PASSWORD) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ error: 'Missing Dexcom credentials in environment' })
        };
    }

    const now = Date.now();

    // Return cached data if valid
    if (cache.data && now - cache.timestamp < CACHE_TTL_MS) {
        return {
            statusCode: 200,
            headers: {
                'Cache-Control': 'public, max-age=120, s-maxage=120',
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(cache.data)
        };
    }

    try {
        // Step 1: Login
        const loginRes = await axios.post<string>(
            `${BASE_URL}/General/LoginPublisherAccountByName`,
            {
                accountName: DEXCOM_USERNAME,
                password: DEXCOM_PASSWORD,
                applicationId: APPLICATION_ID
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const sessionId = loginRes.data;

        // Step 2: Fetch glucose values
        const glucoseRes = await axios.post<GlucoseReading[]>(
            `${BASE_URL}/Publisher/ReadPublisherLatestGlucoseValues`,
            null,
            {
                params: {
                    sessionId,
                    minutes: 1440,
                    maxCount: 1
                },
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const reading = glucoseRes.data[0];
        const trendDescriptions: Record<string, string> = {
            "None": '&#10060;',
            "DoubleUp": '&uarr;&uarr;',
            "SingleUp": '&uarr;',
            "FortyFiveUp": '&nearr;',
            "Flat": '&rarr;',
            "FortyFiveDown": '&searr;',
            "SingleDown": '&darr;',
            "DoubleDown": '&darr;&darr;',
            "NotComputable": '&#10060;',
            "RateOutOfRange": '&#10060;'
        };

        const trendDescriptionsUnicode: Record<string, string> = {
            "None": '❌',
            "DoubleUp": '↑↑',
            "SingleUp": '↑',
            "FortyFiveUp": '↗',
            "Flat": '→',
            "FortyFiveDown": '↘',
            "SingleDown": '↓',
            "DoubleDown": '↓↓',
            "NotComputable": '❌',
            "RateOutOfRange": '❌'
        };

        const timestampMillis = parseInt(reading.WT.match(/\d+/)?.[0] || '0', 10);
        const isoTimestamp = new Date(timestampMillis).toISOString();

        const result: DexcomResponse = {
            value: reading.Value,
            trend: reading.Trend,
            trendDescription: trendDescriptions[reading.Trend] || 'Unknown',
            trendDescriptionUnicode: trendDescriptionsUnicode[reading.Trend] || 'Unknown',
            timestamp: isoTimestamp,
            parsedTimestamp: new Date(isoTimestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' }),
            cached: false
        };

        cache = {
            timestamp: now,
            data: { ...result, cached: true }
        };

        return {
            statusCode: 200,
            headers: {
                'Cache-Control': 'public, max-age=120, s-maxage=120',
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(result)
        };
    } catch (err: unknown) {
        const error = err as any;
        console.error(error?.response?.data || error?.message || error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ error: error.message})
        };
    }
};
