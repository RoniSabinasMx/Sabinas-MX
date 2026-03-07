/**
 * SABINAS SPA — Hero Cinematic Animation
 * Maneja el delay para la transición del logo desde el centro hacia la esquina.
 */
export function initHeroCinematic() {
    const heroLogo = document.getElementById('hero-logo-container');

    if (heroLogo) {
        // Espera 5 segundos (5000ms) para encoger el logo hacia la esquina
        setTimeout(() => {
            heroLogo.classList.add('is-minimized');
        }, 5000);
    }
}
