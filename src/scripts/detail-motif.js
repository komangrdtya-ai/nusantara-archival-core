// src/scripts/detail-motif.js

function inisialisasiDetailInteraktif() {
    // Tangkap elemen-elemen DOM pop-up
    const gambarUtama = document.querySelector('.gambar-detail-kain');
    const modalPopup = document.getElementById('popup-motif-full');
    const btnTutup = document.getElementById('btn-tutup-popup');

    if (gambarUtama && modalPopup && btnTutup) {

        // 1. FUNGSI MEMBUKA POP-UP (SAAT GAMBAR DIKLIK)
        gambarUtama.addEventListener('click', () => {
            // Hilangkan class hidden terlebih dahulu
            modalPopup.classList.remove('hidden');

            // Berikan jeda mikro agar efek transisi pudar animasi (opacity) berjalan halus
            setTimeout(() => {
                modalPopup.classList.remove('opacity-0', 'pointer-events-none');
                modalPopup.classList.add('opacity-100', 'pointer-events-auto');
            }, 10);

            // Kunci scroll body utama website agar tidak goyang saat pop-up aktif
            document.body.style.overflow = 'hidden';
        });

        // 2. FUNGSI MENUTUP POP-UP
        const tutupModal = () => {
            modalPopup.classList.remove('opacity-100', 'pointer-events-auto');
            modalPopup.classList.add('opacity-0', 'pointer-events-none');

            // Kembalikan scroll body utama seperti semula
            document.body.style.overflow = '';

            // Kembalikan class hidden setelah animasi pudar selesai (300ms)
            setTimeout(() => {
                if (modalPopup.classList.contains('opacity-0')) {
                    modalPopup.classList.add('hidden');
                }
            }, 300);
        };

        // Jalankan fungsi tutup saat tombol silang dipencet
        btnTutup.addEventListener('click', (e) => {
            e.stopPropagation();
            tutupModal();
        });

        // Jalankan fungsi tutup jika user iseng ngeklik area hitam di luar gambar
        modalPopup.addEventListener('click', (e) => {
            if (e.target === modalPopup) {
                tutupModal();
            }
        });

        // Jalankan fungsi tutup jika user menekan tombol 'Escape' di keyboard komputer
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modalPopup.classList.contains('hidden')) {
                tutupModal();
            }
        });
    }
}

// Support untuk Astro View Transitions
document.addEventListener('DOMContentLoaded', inisialisasiDetailInteraktif);
document.addEventListener('astro:page-load', inisialisasiDetailInteraktif);