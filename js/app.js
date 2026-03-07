/**
 * SABINAS SPA — App Bootstrap
 * Loads all data from Supabase and initialises modules.
 */
import { I18nManager } from './i18n.js?v=8';
import { initScrollEffects } from './scroll.js?v=9';
import { initMagneticButtons } from './magnetic.js?v=9';
import { initOracle } from './oracle.js?v=9';
import { initCalendar } from './calendar.js?v=11';
import { initNav } from './nav.js?v=11';
import { initHeroCinematic } from './hero.js?v=11';
import {
    fetchServices,
    fetchSponsors,
    fetchSetting,
    fetchEvents,
    fetchServiceById
} from './supabase.js';
import { openElementModal } from './element.js';

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
    const now = new Date();
    const [, rawServices, sponsors, waNumber, disabledDatesRaw, eventsRaw] = await Promise.allSettled([
        i18n.setLocale('es'),
        fetchServices(),
        fetchSponsors(),
        fetchSetting('whatsapp_number'),
        fetchSetting('disabled_dates'),
        fetchEvents(now.getFullYear(), now.getMonth() + 1)
    ]);

    // ── 2. Expose globals ──
    const services = (rawServices.value || []).map(r => toServiceShape(r, 'es'));

    window._services = services;
    window._waNumber = waNumber.value || '529841802741';
    window._disabledDates = JSON.parse(disabledDatesRaw.value || '[]');
    window._events = eventsRaw.value || [];

    // ── 3. Render dynamic parts ──
    renderSponsors(sponsors.value || []);

    // ── 4. Update translations helper ──
    window.updateTranslations = () => i18n.updateDOM();

    // ── 5. Init all modules ──
    initScrollEffects();
    initMagneticButtons();
    initOracle();
    initCalendar();
    initNav();
    initHeroCinematic();

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
    function closeGlobalModal() {
        document.querySelectorAll('.sabinas-modal-overlay').forEach(overlay => {
            overlay.classList.remove('active');
            const inner = overlay.querySelector('.sabinas-modal');
            if (inner) inner.classList.remove('is-active', 'is-pushed-back');
        });
        document.body.classList.remove('no-scroll');
    }

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeGlobalModal);
    });

    document.querySelectorAll('.sabinas-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === e.currentTarget) {
                if (overlay.id === 'wa-bottom-sheet') {
                    overlay.classList.remove('active'); // only close bottom sheet
                } else {
                    closeGlobalModal();
                }
            }
        });
    });

    document.querySelector('.sheet-close').addEventListener('click', () => {
        document.getElementById('wa-bottom-sheet').classList.remove('active');
    });

    document.querySelector('.modal-back').addEventListener('click', () => {
        document.getElementById('service-modal').classList.remove('active');
        const serviceInner = document.querySelector('#service-modal .sabinas-modal');
        if (serviceInner) serviceInner.classList.remove('is-active');

        // Restore element modal
        const elementInner = document.querySelector('#element-modal .sabinas-modal');
        if (elementInner) elementInner.classList.remove('is-pushed-back');
    });

    // Toggle scroll lock helper
    window._toggleScrollLock = (isActive) => {
        if (isActive) document.body.classList.add('no-scroll');
        else document.body.classList.remove('no-scroll');
    };

    // Override spotlight & oracle close behavior to remove scroll lock
    document.getElementById('close-spotlight').addEventListener('click', () => window._toggleScrollLock(false));
    document.getElementById('close-oracle').addEventListener('click', () => window._toggleScrollLock(false));

    // Add scroll lock interceptor on Spotlight & Oracle open
    document.getElementById('path-search').addEventListener('click', () => window._toggleScrollLock(true));
    document.getElementById('path-quiz').addEventListener('click', () => window._toggleScrollLock(true));

    // ── 7b. Global Service Router (Spatial Push Transition) ──
    window.openServiceDetails = async (id) => {
        const currentLang = document.getElementById('lang-toggle').textContent.startsWith('ESP') ? 'es' : 'en';

        // 1. Push back element modal if exists
        const elementModalInner = document.querySelector('#element-modal .sabinas-modal');
        if (elementModalInner) {
            elementModalInner.classList.add('is-pushed-back');
        }

        // 2. Setup Service Modal
        const serviceModal = document.getElementById('service-modal');
        const serviceModalInner = serviceModal.querySelector('.sabinas-modal');
        const content = document.getElementById('service-modal-content');
        const waBtn = document.getElementById('service-wa-btn');

        content.innerHTML = `<p style="padding: 2.5rem; text-align: center; color: var(--clr-text-muted);">Cargando detalles...</p>`;

        serviceModal.classList.add('active');
        // Small delay for DOM layout calc before transition
        setTimeout(() => serviceModalInner.classList.add('is-active'), 10);
        window._toggleScrollLock(true);

        // Fetch full data
        const data = await fetchServiceById(id);
        if (!data) {
            content.innerHTML = `<p style="padding: 2.5rem; text-align: center; color: var(--clr-danger);">Error al cargar servicio.</p>`;
            return;
        }

        const name = currentLang === 'es' ? data.name_es : data.name_en;
        const desc = currentLang === 'es' ? data.description_es : data.description_en;
        const waMsgTemplate = currentLang === 'es' ? data.wa_es : data.wa_en;

        // Save for WA interaction
        window._currentWaTemplate = waMsgTemplate;

        const { supabaseUrl } = window.SABINAS_CONFIG || {};
        const imgHtml = data.image_url && supabaseUrl
            ? `<div style="height: 240px; overflow: hidden; position: relative;">
                 <img src="${supabaseUrl}/storage/v1/object/public/service-images/${data.image_url}" style="width: 100%; height: 100%; object-fit: cover;" alt="${name}" />
                 <div style="position: absolute; inset: 0; background: linear-gradient(to top, var(--clr-bg), transparent 30%);"></div>
               </div>`
            : '';

        content.className = 'no-scrollbar';
        content.style.padding = imgHtml ? '0' : '2rem';
        content.style.overflowY = 'auto';
        content.style.flex = '1';

        content.innerHTML = `
            ${imgHtml}
            <div style="padding: ${imgHtml ? '0 2rem 3rem 2rem' : '0'}; text-align: center; max-width: 600px; margin: 0 auto;">
                <span style="font-size: 0.75rem; letter-spacing: 0.2em; color: var(--clr-sand); text-transform: uppercase;">${data.duration || ''}</span>
                <h2 style="font-family: var(--font-display); font-size: 2.2rem; color: var(--clr-text); margin: 0.5rem 0 1.5rem;">${name}</h2>
                <p style="color: var(--clr-text-muted); font-size: 1.05rem; line-height: 1.7; white-space: pre-wrap; text-align: left;">${desc || ''}</p>
            </div>
        `;

        waBtn.textContent = (window._t('oracle.reserve_btn') || 'Reservar') + ' ↗';
        waBtn.onclick = () => {
            const input = document.getElementById('wa-name-input');
            input.value = '';
            input.dispatchEvent(new Event('input')); // trigger validation
            document.getElementById('wa-bottom-sheet').classList.add('active');
            setTimeout(() => input.focus(), 300); // autofocus gracefully
        };

        // Close spotlight/oracle too
        document.getElementById('spotlight-overlay').classList.remove('active');
        document.getElementById('oracle-overlay').classList.remove('active');
    };

    // ── 7c. WhatsApp Bottom Sheet Logic ──
    const nameInput = document.getElementById('wa-name-input');
    const waContinueBtn = document.getElementById('wa-continue-btn');

    nameInput.addEventListener('input', (e) => {
        if (e.target.value.trim().length > 1) {
            waContinueBtn.disabled = false;
        } else {
            waContinueBtn.disabled = true;
        }
    });

    waContinueBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const baseMsg = window._currentWaTemplate || 'Hola';
        const date = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

        // Replace templates
        let finalMsg = baseMsg.replace('{{date}}', date);
        if (finalMsg.includes('{{nombre}}')) {
            finalMsg = finalMsg.replace('{{nombre}}', name);
        } else {
            // Append name if not in template explicitly
            finalMsg = `Soy ${name}. ` + finalMsg;
        }

        const waUrl = `https://wa.me/${window._waNumber}?text=${encodeURIComponent(finalMsg)}`;

        // Open WA
        window.open(waUrl, '_blank');

        // Close modals
        closeGlobalModal();
    });

    // ── 8. Nav element buttons → open modal ──
    document.querySelectorAll('.btn-elemento[data-element]').forEach(btn => {
        btn.addEventListener('click', () => {
            openElementModal(btn.dataset.element);
            window._toggleScrollLock(true);
        });
    });

    // ── 9. Footer element links ──
    document.querySelectorAll('.footer-el-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            // Need to get data-element from the nav since it doesn't currently exist in HTML on footer links
            let elem = link.dataset.element;
            if (!elem) {
                // simple mapping based on text content since they are translated
                const text = link.textContent.toLowerCase();
                if (text.includes('agua') || text.includes('water')) elem = 'agua';
                else if (text.includes('aire') || text.includes('air')) elem = 'aire';
                else if (text.includes('fuego') || text.includes('fire')) elem = 'fuego';
                else if (text.includes('tierra') || text.includes('earth')) elem = 'tierra';
                else if (text.includes('éter') || text.includes('eter') || text.includes('ether')) elem = 'eter';
            }
            if (elem) openElementModal(elem);
        });
    });

    // ── 10. Populate spotlight on open ──
    document.getElementById('path-search').addEventListener('click', () => {
        const input = document.getElementById('spotlight-input');
        input.value = '';
        input.dispatchEvent(new Event('input'));
    });

});
