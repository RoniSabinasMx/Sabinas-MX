export function initScrollEffects() {
    const headerPill = document.querySelector('.header-pill');

    // Floating Pill Header reveal logic
    const checkHeaderReveal = () => {
        if (!headerPill) return;
        const currentScroll = window.pageYOffset;
        const revealThreshold = 100; // Revela tras bajar 100px desde arriba

        if (currentScroll > revealThreshold) {
            headerPill.classList.add('is-scrolled');
        } else {
            headerPill.classList.remove('is-scrolled');
        }
    };

    window.addEventListener('scroll', checkHeaderReveal);
    // Verificar en Load para inicializaciones a medio scroll
    checkHeaderReveal();

    // Reveal animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                if (entry.target.dataset.parallax) {
                    initParallax(entry.target);
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function initParallax(el) {
    const speed = parseFloat(el.dataset.parallax) || 0.1;
    window.addEventListener('scroll', () => {
        const y = window.pageYOffset;
        const offset = y * speed;
        el.style.transform = `translateY(${offset}px)`;
    });
}
