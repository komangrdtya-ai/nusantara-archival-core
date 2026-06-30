// src/scripts/audioHero.js

export function initAudioHero() {
    const audio = document.getElementById('audio-batik-ambient');
    const btnControl = document.getElementById('btn-audio-control');
    const waveLines = document.getElementById('g-wave-lines');

    if (!audio || !btnControl || !waveLines) return;

    // Setel volume penuh
    audio.volume = 1.0;

    // 1. FUNGSI RENDER IKON SPEAKER
    function renderIkonSpeaker(sedangBerbunyi) {
        if (sedangBerbunyi) {
            waveLines.innerHTML = `
                <path class="animate-wave-1" d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path class="animate-wave-2" d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            `;
            btnControl.classList.add('border-[#c5a059]/40', 'text-[#c5a059]');
        } else {
            waveLines.innerHTML = `
                <line class="animate-mute-line" x1="23" y1="9" x2="17" y2="15"></line>
                <line class="animate-mute-line-2" x1="17" y1="9" x2="23" y2="15"></line>
            `;
            btnControl.classList.remove('border-[#c5a059]/40', 'text-[#c5a059]');
        }
    }

    // 2. STRATEGI BYPASS JITU
    function cobaMainkanOtomatis() {
        audio.play().then(() => {
            renderIkonSpeaker(true);
            sessionStorage.setItem('audio_playing', 'true');
            bersihkanListenerPemicu();
        }).catch(() => {
            renderIkonSpeaker(false);
        });
    }

    function bersihkanListenerPemicu() {
        document.removeEventListener('click', picuAudioLewatInteraksi);
        document.removeEventListener('keydown', picuAudioLewatInteraksi);
        window.removeEventListener('scroll', picuAudioLewatInteraksi);
        window.removeEventListener('wheel', picuAudioLewatInteraksi); // Bersihkan sensor mousepad
        document.removeEventListener('touchmove', picuAudioLewatInteraksi); // Bersihkan sensor HP
    }

    // Fungsi pemicu utama saat ada interaksi
    function picuAudioLewatInteraksi() {
        audio.play().then(() => {
            renderIkonSpeaker(true);
            sessionStorage.setItem('audio_playing', 'true');
            bersihkanListenerPemicu(); // Langsung matikan jebakan begitu musik jalan
        }).catch(() => { });
    }

    // Cek memori status terakhir
    const statusTerakhir = sessionStorage.getItem('audio_playing');

    if (statusTerakhir === 'false') {
        audio.pause();
        renderIkonSpeaker(false);
    } else {
        cobaMainkanOtomatis();

        // 👑 PERTAHANAN MULTI-SENSOR TOTAL (Anti-Mogok di Mousepad Laptop & HP)
        document.addEventListener('click', picuAudioLewatInteraksi);
        document.addEventListener('keydown', picuAudioLewatInteraksi);
        window.addEventListener('scroll', picuAudioLewatInteraksi, { passive: true });

        // 🚀 SENSOR MOUSEPAD LAPTOP: Menangkap geseran dua jari secara realtime
        window.addEventListener('wheel', picuAudioLewatInteraksi, { passive: true });

        // 📱 SENSOR LAYAR HP: Menangkap usapan jempol di smartphone
        document.addEventListener('touchmove', picuAudioLewatInteraksi, { passive: true });
    }

    // 3. LOGIKA MANUAL TOMBOL SPEAKER KLIK
    btnControl.onclick = (e) => {
        e.stopPropagation();
        bersihkanListenerPemicu();

        if (audio.paused) {
            audio.play().then(() => {
                renderIkonSpeaker(true);
                sessionStorage.setItem('audio_playing', 'true');
            }).catch(err => console.log("Gagal play manual:", err));
        } else {
            audio.pause();
            renderIkonSpeaker(false);
            sessionStorage.setItem('audio_playing', 'false');
        }
    };
}

export function matikanAudioTotal() {
    const audio = document.getElementById('audio-batik-ambient');
    if (audio) {
        audio.pause();
    }
}