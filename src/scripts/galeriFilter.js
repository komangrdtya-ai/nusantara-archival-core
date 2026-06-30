// src/scripts/galeriFilter.js

document.addEventListener('astro:page-load', () => {
    const searchInput = document.getElementById('cari-batik');
    const cards = document.querySelectorAll('.kartu-galeri');

    if (!searchInput || cards.length === 0) return;

    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase().trim();

        cards.forEach((card) => {
            const nama = card.getAttribute('data-nama').toLowerCase();
            const provinsi = card.getAttribute('data-provinsi').toLowerCase();

            if (nama.includes(keyword) || provinsi.includes(keyword)) {
                card.style.display = 'block';
                // Efek fade-in kecil saat kartu muncul kembali
                setTimeout(() => {
                    card.style.opacity = '1';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.display = 'none';
            }
        });
    });
}); 