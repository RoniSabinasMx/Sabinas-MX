/**
 * SABINAS SPA — i18n Manager
 * Fetches locale strings from Supabase (locale_strings table).
 * Falls back to local ./locales/{lang}.json if Supabase is unavailable.
 */
import { fetchLocaleStrings } from './supabase.js';

export class I18nManager {
    constructor() {
        this.locale = 'es';
        this.data = {};
        this._cache = {};   // { es: {...}, en: {...} }
    }

    async setLocale(lang) {
        try {
            if (!this._cache[lang]) {
                // Try Supabase first
                try {
                    this._cache[lang] = await fetchLocaleStrings(lang);
                    // Supabase doesn't include services/sponsors —
                    // those are fetched separately in app.js
                } catch (supabaseErr) {
                    console.warn('[i18n] Supabase unavailable, falling back to local JSON', supabaseErr);
                    const res = await fetch(`./locales/${lang}.json`);
                    this._cache[lang] = await res.json();
                }
            }

            this.data = this._cache[lang];
            this.locale = lang;
            this.updateDOM();
            document.documentElement.lang = lang;
        } catch (e) {
            console.error('[i18n] Failed to load locale:', e);
        }
    }

    /** Invalidate cache for a language (useful after admin updates) */
    bust(lang) {
        delete this._cache[lang];
    }

    updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = this.getNestedValue(this.data, key);
            if (!value) return;
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = value;
            } else {
                el.innerText = value;
            }
        });
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }
}

export const i18n = new I18nManager();
