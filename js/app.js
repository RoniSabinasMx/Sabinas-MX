/**
 * SABINAS SPA — App Bootstrap
 * Loads all data from Supabase and initialises modules.
 */
import { I18nManager } from './i18n.js';
import { initScrollEffects } from './scroll.js';
import { initMagneticButtons } from './magnetic.js';
import { initOracle } from './oracle.js';
import { initCalendar } from './calendar.js';
import {
    fetchServices,
    fetchSponsors,
    fetchSetting
} from './supabase.js';

const i18n = new I18nManager();

// Expose translation helper globally for dynamic components
window._t = (key) => i18n.getNestedValue(i18n.data, key) || key;

/** Convert a Supabase service row to the shape expected by oracle/calendar */
function toServiceShape(row, lang) {
    return {
        id: row.id,
        name: lang === 'es' ? row.name_es : row.name_en,
        category: row.category,
        modality: row.modality,
        intensity: row.intensity,
        element: row.element,
        duration: row.duration,
        wa: lang === 'es' ? row.wa_es : row.wa_en
    };
}

/** Render the sponsor marquee from fetched sponsor data */
function renderSponsors(sponsors) {
    const track = document.querySelector('.marquee-track');
    if (!track || !sponsors?.length) return;
    const items = sponsors
        .map(s => `<a href="${s.url}" class="marquee-item">${s.name}</a>`)
        .join('');
    // Duplicate for seamless loop
    track.innerHTML = items + items;
}

document.addEventListener('DOMContentLoaded', async () => {

    // ── 1. Load locale strings & services in parallel ──
    const [, rawServices, sponsors, waNumber, disabledDatesRaw] = await Promise.allSettled([
        i18n.setLocale('es'),
        fetchServices(),
        fetchSponsors(),
        fetchSetting('whatsapp_number'),
        fetchSetting('disabled_dates')
    ]);

    // ── 2. Expose globals ──
    const services = (rawServices.value || []).map(r => toServiceShape(r, 'es'));

    window._services = services;
    window._waNumber = waNumber.value || '529841802741';
    window._disabledDates = JSON.parse(disabledDatesRaw.value || '[]');

    // ── 3. Render dynamic parts ──
    renderSponsors(sponsors.value || []);

    // ── 4. Update translations helper ──
    window.updateTranslations = () => i18n.updateDOM();

    // ── 5. Init all modules ──
    initScrollEffects();
    initMagneticButtons();
    initOracle();
    initCalendar();

    // ── 6. Language toggle ──
    document.getElementById('lang-toggle').addEventListener('click', async () => {
        const next = i18n.locale === 'es' ? 'en' : 'es';
        await i18n.setLocale(next);

        // Re-map services to new language
        window._services = (rawServices.value || []).map(r => toServiceShape(r, next));
        window._waNumber = window._waNumber; // stays the same

        document.getElementById('lang-toggle').textContent =
            next === 'es' ? 'ESP | ENG' : 'ENG | ESP';
    });

    // ── 7. Global modal close ──
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('global-modal').classList.remove('active');
        document.getElementById('modal-iframe').src = 'about:blank';
    });
    document.getElementById('global-modal').addEventListener('click', e => {
        if (e.target === e.currentTarget) {
            document.getElementById('global-modal').classList.remove('active');
        }
    });

    // ── 8. Nav element buttons → open modal ──
    document.querySelectorAll('.nav-btn[data-element]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('modal-title').textContent = btn.textContent;
            document.getElementById('modal-iframe').src = 'about:blank';
            document.getElementById('modal-wa-btn').href = '#';
            document.getElementById('global-modal').classList.add('active');
        });
    });

    // ── 9. Footer element links ──
    document.querySelectorAll('.footer-el-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            document.getElementById('modal-title').textContent = link.textContent;
            document.getElementById('modal-wa-btn').href = '#';
            document.getElementById('global-modal').classList.add('active');
        });
    });

    // ── 10. Populate spotlight on open ──
    document.getElementById('path-search').addEventListener('click', () => {
        const input = document.getElementById('spotlight-input');
        input.value = '';
        input.dispatchEvent(new Event('input'));
    });
});
