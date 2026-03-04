export function initScrollEffects() {
    const header = document.getElementById('site-header');
    let lastScroll = 0;

    // Header show/hide
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > lastScroll && currentScroll > 100) {
            header.classList.remove('header-active');
            header.classList.add('header-hidden');
        } else {
            header.classList.add('header-active');
            header.classList.remove('header-hidden');
        }
        lastScroll = currentScroll;
    });

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
