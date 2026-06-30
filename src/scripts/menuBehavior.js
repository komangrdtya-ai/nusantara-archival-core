// src/scripts/menuBehavior.js

document.addEventListener('astro:page-load', () => {
    const btn = document.getElementById('menu-btn');
    const overlay = document.getElementById('menu-overlay');
    const line1 = document.getElementById('line-1');
    const line2 = document.getElementById('line-2');
    const links = document.querySelectorAll('.js-menu-link');

    // Jika elemen tidak ditemukan di halaman ini, hentikan script agar tidak error
    if (!btn || !overlay || !line1 || !line2) return;

    let isOpen = false;

    function toggleMenu() {
        isOpen = !isOpen;
        if (isOpen) {
            overlay.classList.remove('opacity-0', 'pointer-events-none');
            overlay.classList.add('opacity-100', 'pointer-events-auto');
            line1.style.transform = 'rotate(45deg) translate(6px, 6px)';
            line2.style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            overlay.classList.add('opacity-0', 'pointer-events-none');
            overlay.classList.remove('opacity-100', 'pointer-events-auto');
            line1.style.transform = 'none';
            line2.style.transform = 'none';
        }
    }

    // Pasang fungsi klik
    btn.onclick = toggleMenu;

    links.forEach(link => {
        link.onclick = () => { if (isOpen) toggleMenu(); };
    });
});