/**
 * SABINAS SPA — Supabase Client
 * Initialised from window.SABINAS_CONFIG (config/config.js, gitignored)
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

if (!window.SABINAS_CONFIG) {
    console.error('[Sabinas] config/config.js not loaded. Copy config.example.js → config.js and fill in your keys.');
}

const { supabaseUrl, supabaseKey } = window.SABINAS_CONFIG || {};
export const db = createClient(supabaseUrl, supabaseKey);

// ── Helpers ──────────────────────────────────────────────────

/** Fetch all services, ordered by sort_order */
export async function fetchServices() {
    const { data, error } = await db
        .from('services')
        .select('*')
        .order('sort_order');
    if (error) throw error;
    return data;
}

/** Fetch all locale strings for a given language and return flat object */
export async function fetchLocaleStrings(lang) {
    const { data, error } = await db
        .from('locale_strings')
        .select('key, value')
        .eq('lang', lang);
    if (error) throw error;

    // Convert [{key:'nav.agua', value:'Agua'}, …] → nested object
    return data.reduce((acc, { key, value }) => {
        const parts = key.split('.');
        let cur = acc;
        parts.forEach((part, i) => {
            if (i === parts.length - 1) {
                cur[part] = value;
            } else {
                cur[part] = cur[part] || {};
                cur = cur[part];
            }
        });
        return acc;
    }, {});
}

/** Fetch sponsors ordered by sort_order */
export async function fetchSponsors() {
    const { data, error } = await db
        .from('sponsors')
        .select('*')
        .order('sort_order');
    if (error) throw error;
    return data;
}

/** Fetch a single setting by key */
export async function fetchSetting(key) {
    const { data, error } = await db
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();
    if (error) return null;
    return data?.value ?? null;
}
