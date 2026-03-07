export function initNav() {
    const hamburgerBtn = document.getElementById('mobile-menu-btn');
    const mobileDropdown = document.getElementById('mobile-dropdown');

    if (!hamburgerBtn || !mobileDropdown) return;

    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('is-active');
        mobileDropdown.classList.toggle('is-open');
    });

    // Option to close menu when an element is clicked
    document.querySelectorAll('.mobile-dropdown .btn-elemento').forEach(btn => {
        btn.addEventListener('click', () => {
            hamburgerBtn.classList.remove('is-active');
            mobileDropdown.classList.remove('is-open');
        });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburgerBtn.contains(e.target) && !mobileDropdown.contains(e.target) && mobileDropdown.classList.contains('is-open')) {
            hamburgerBtn.classList.remove('is-active');
            mobileDropdown.classList.remove('is-open');
        }
    });
}
