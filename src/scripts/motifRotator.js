// src/scripts/motifRotator.js
function initBySquareRotator() {
    const container = document.getElementById("deck-container");
    const infoZone = document.getElementById("motif-info-zone");

    if (!container || !infoZone) return;

    const cards = Array.from(container.querySelectorAll(".museum-card"));
    const idEl = document.getElementById("motif-id");
    const nameEl = document.getElementById("motif-name");
    const regionEl = document.getElementById("motif-region");
    const symbolicEl = document.getElementById("motif-symbolic");

    if (cards.length === 0 || !idEl || !nameEl || !regionEl || !symbolicEl) return;

    let isAnimating = false;

    function updateTextContent(activeCard) {
        idEl.innerText = activeCard.getAttribute("data-id");
        // Kita tidak langsung set teks untuk animasi, biarkan fungsi utama yang mengurus kemunculannya
    }

    function updateDeckVisuals() {
        cards.forEach((card, index) => {
            card.classList.remove(
                "card-pos-0", "card-pos-1", "card-pos-2", "card-pos-3", "card-pos-4",
                "card-pos-5", "card-pos-6", "card-pos-7", "card-pos-8", "card-pos-9"
            );

            if (index < 10) {
                card.classList.add(`card-pos-${index}`);
            }

            if (index === 0) {
                card.style.pointerEvents = "auto";
            } else {
                card.style.pointerEvents = "none";
            }
        });
    }

    updateDeckVisuals();
    
    // Terapkan kotak fokus pada saat halaman pertama kali dimuat
    symbolicEl.classList.add("makna-fokus-box", "muncul");
    
    // Interaksi Tooltip Provinsi
    const regionHoverArea = document.getElementById("region-hover-area");
    const btnArsipLengkap = document.getElementById("btn-arsip-lengkap");
    const regionCount = document.getElementById("region-count");
    
    // Set jumlah motif awal berdasarkan data di HTML
    try {
        const countsData = JSON.parse(container.getAttribute("data-counts") || "{}");
        if (regionCount && countsData[regionEl.innerText]) {
            regionCount.innerText = countsData[regionEl.innerText];
        }
    } catch (e) {}

    if (regionHoverArea && btnArsipLengkap) {
        regionHoverArea.onclick = (e) => {
            e.stopPropagation(); // Mencegah klik memicu rotasi kartu
            
            // Scroll halus ke tombol arsip
            btnArsipLengkap.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Tambahkan efek kedip menyala
            btnArsipLengkap.classList.remove("blink-glow"); // Reset kalau dipencet berkali-kali
            void btnArsipLengkap.offsetWidth; // Trigger reflow untuk mereset animasi CSS
            btnArsipLengkap.classList.add("blink-glow");
            
            // Hapus kelas setelah animasi selesai (2.5s)
            setTimeout(() => {
                btnArsipLengkap.classList.remove("blink-glow");
            }, 2500);
        };
    }
    
    container.onclick = null; // Mencegah klik bertumpuk saat reload Astro

    // Fungsi untuk efek mesin tik (typewriter) yang dapat dilacak selesainya
    function typeWriter(element, text, speed = 15) {
        return new Promise((resolve) => {
            element.innerHTML = "";
            let i = 0;
            function type() {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    resolve(); // Memberi tahu bahwa pengetikan telah 100% selesai
                }
            }
            type();
        });
    }

    container.onclick = () => {
        if (isAnimating || cards.length <= 1) return;
        isAnimating = true;

        const topCard = cards[0];
        
        // 1. Eksekusi Animasi Zoom terlebih dahulu
        topCard.classList.add("card-clicked");

        // 2. Tunggu 350ms agar zoom terlihat, lalu jalankan animasi transisi pindah bingkai
        setTimeout(() => {
            topCard.classList.add("card-slide-down");

            // Sembunyikan teks lama
            setTimeout(() => {
                nameEl.style.opacity = "0";
                nameEl.classList.remove("anim-slide-left");
                
                regionEl.parentElement.style.opacity = "0";
                regionEl.parentElement.classList.remove("anim-slide-down");
                
                symbolicEl.parentElement.style.opacity = "0";
                symbolicEl.innerHTML = ""; // Bersihkan teks lama untuk persiapan ketik
                symbolicEl.classList.remove("muncul"); // Sembunyikan kotaknya
            }, 200);

            setTimeout(() => {
                topCard.classList.remove("card-slide-down");
                topCard.classList.remove("card-clicked"); // reset zoom

                cards.shift();
                cards.push(topCard);

                updateDeckVisuals();
                updateTextContent(cards[0]); // Hanya update ID tersembunyi

                const nextCard = cards[0];
                const newName = nextCard.getAttribute("data-nama");
                const newRegion = nextCard.getAttribute("data-provinsi");
                const newMakna = nextCard.getAttribute("data-makna");

                // --- SEKUEN ANIMASI CAMPUR ADUK ---
                
                // Urutan 1: Nama Motif (Slide In Left)
                nameEl.innerText = newName;
                nameEl.classList.add("anim-slide-left");
                
                // Urutan 2: Provinsi (Slide In Down) - Muncul setelah 200ms
                setTimeout(() => {
                    regionEl.innerText = newRegion;
                    regionEl.parentElement.classList.add("anim-slide-down");
                    
                    // Update jumlah motif di tooltip
                    try {
                        const countsData = JSON.parse(container.getAttribute("data-counts") || "{}");
                        if (regionCount) {
                            regionCount.innerText = countsData[newRegion] || 0;
                        }
                    } catch (e) {}
                }, 200);

                // Urutan 3: Makna Filosofis (Typewriter Effect + Munculnya Kotak) - Mulai setelah 400ms
                setTimeout(() => {
                    symbolicEl.parentElement.style.opacity = "1"; // Munculkan wadah labelnya
                    symbolicEl.classList.add("muncul"); // Animasikan kotak fokusnya muncul dari bawah
                    
                    setTimeout(() => {
                        // Mulai ngetik setelah kotak selesai mengembang
                        typeWriter(symbolicEl, newMakna, 12).then(() => {
                            // Gembok Anti-Spam dibuka HANYA setelah titik terakhir selesai diketik!
                            isAnimating = false; 
                        });
                    }, 200);
                }, 450);

            }, 1000);
        }, 350); // Waktu tunda zoom
    };
}

// Menangani rendering Astro yang kadang nyelip
document.addEventListener("DOMContentLoaded", initBySquareRotator);
document.addEventListener("astro:page-load", initBySquareRotator);