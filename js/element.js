import { fetchServicesByElement } from './supabase.js';

export async function openElementModal(element) {
    const t = window._t;
    const modal = document.getElementById('element-modal');
    const contentInner = modal.querySelector('.sabinas-modal');
    const contentContainer = document.getElementById('element-modal-content');
    const title = document.getElementById('element-modal-title');

    // Reset push back state
    contentInner.classList.remove('is-pushed-back');

    // Ensure scrolling container
    contentContainer.className = 'no-scrollbar';
    contentContainer.style.padding = '1rem 2rem 2.5rem 2rem';
    contentContainer.style.overflowY = 'auto';
    contentContainer.style.flex = '1';

    // Map element to translated name if possible
    const elementNames = {
        'agua': t('nav.agua'),
        'fuego': t('nav.fuego'),
        'tierra': t('nav.tierra'),
        'aire': t('nav.aire'),
        'eter': t('nav.eter')
    };
    title.textContent = elementNames[element] || (element.charAt(0).toUpperCase() + element.slice(1));

    // Loading state
    contentContainer.innerHTML = `<p style="padding: 2.5rem; text-align: center; color: var(--clr-text-muted);">Cargando...</p>`;

    modal.classList.add('active');
    // We add a tiny delay to ensure display block is processed before adding is-active for transition
    setTimeout(() => contentInner.classList.add('is-active'), 10);

    try {
        // Fetch raw services by element so we get all logic
        const servicesRows = await fetchServicesByElement(element);
        const currentLang = document.getElementById('lang-toggle').textContent.startsWith('ESP') ? 'es' : 'en'; // Simple heuristic or use i18n logic

        // Use localized names from window._services if possible, otherwise map it
        const localizedServices = servicesRows.map(row => {
            const loc = window._services?.find(s => s.id === row.id);
            if (loc) return loc;
            return {
                id: row.id,
                name: currentLang === 'es' ? row.name_es : row.name_en,
                category: row.category,
                modality: row.modality,
                intensity: row.intensity,
                element: row.element,
                duration: row.duration,
                wa: currentLang === 'es' ? row.wa_es : row.wa_en
            };
        });

        // Group them
        const cuerpo = localizedServices.filter(s => s.category === 'cuerpo' || s.category === 'inmersion');
        const espiritu = localizedServices.filter(s => s.category === 'espiritu');
        const mente = localizedServices.filter(s => s.category === 'mente');

        const renderGroup = (labelKey, list) => {
            if (!list.length) return '';
            // We use simple labels since this is dynamic
            const label = labelKey;
            return `
                <div style="margin-bottom: 2rem;">
                    <h3 style="font-family: var(--font-display); font-size: 1.4rem; color: var(--clr-primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--clr-border);">
                        ${label}
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${list.map(s => `
                            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--clr-bg-alt); padding: 1rem; border-radius: 12px; border: 1px solid var(--clr-border);">
                                <div>
                                    <h4 style="margin: 0; font-size: 1.1rem; font-weight: 500; font-family: var(--font-body);">${s.name}</h4>
                                    <span style="font-size: 0.85rem; color: var(--clr-text-muted);">${s.duration}</span>
                                </div>
                                <button onclick="window.openServiceDetails('${s.id}')" 
                                   style="cursor: pointer; background: transparent; text-decoration: none; font-family: var(--font-body); font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px solid currentColor; border-radius: 99px; color: var(--clr-accent); transition: all 0.2s ease;"
                                   onmouseover="this.style.background='var(--clr-accent)'; this.style.color='var(--clr-bg)'"
                                   onmouseout="this.style.background='transparent'; this.style.color='var(--clr-accent)'">
                                    Ver detalles ↗
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        };

        const langCode = currentLang === 'es' ? 'es' : 'en';
        const labels = {
            cuerpo: langCode === 'es' ? 'Para tu Cuerpo' : 'For your Body',
            espiritu: langCode === 'es' ? 'Para tu Espíritu' : 'For your Spirit',
            mente: langCode === 'es' ? 'Para tu Mente' : 'For your Mind',
            empty: langCode === 'es' ? 'No hay servicios disponibles.' : 'No services available.'
        };

        const html = `
                ${renderGroup(labels.cuerpo, cuerpo)}
                ${renderGroup(labels.espiritu, espiritu)}
                ${renderGroup(labels.mente, mente)}
                ${!localizedServices.length ? `<p style="text-align: center; color: var(--clr-text-muted); margin: 3rem 0;">${labels.empty}</p>` : ''}
        `;

        contentContainer.innerHTML = html;

    } catch (e) {
        console.error('Error fetching element services:', e);
        contentContainer.innerHTML = `<p style="padding: 2.5rem; text-align: center; color: var(--clr-danger);">Hubo un error cargando los servicios.</p>`;
    }
}
