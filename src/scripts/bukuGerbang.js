// src/scripts/bukuGerbang.js

export function initBukuGerbang() {
    const boxTertutup = document.getElementById('buku-tertutup');
    const boxTerbuka = document.getElementById('buku-terbuka');
    const btnLaboratorium = document.getElementById('btn-link-laboratorium');
    const infoQuest = document.getElementById('teks-info-quest');
    const iconWarning = document.getElementById('icon-warning-quest');
    const progressBar = document.getElementById('line-progress-bar');

    if (!boxTertutup || !boxTerbuka || !btnLaboratorium || !infoQuest) return;

    const datasetMajalah = {
        1: {
            label: "STEP 01 // COMPUTER VISION",
            judul: "Multimodal Vision Engine",
            deskripsi: "Langkah awal dimulai dari komputer vision yang membedah berkas gambar kain batik. AI menganalisis setiap detail visual mulai dari lengkungan canting, guratan ornamen flora/fauna, hingga ekstraksi kode palet warna dominan kain secara real-time."
        },
        2: {
            label: "STEP 02 // KNOWLEDGE BASE",
            judul: "Knowledge Hashing Cross-Check",
            deskripsi: "Hasil matriks visual tadi langsung dikirim untuk dicocokkan ke database arsip kebudayaan global serta berkas lokal (metada_batik.json & metadata_batik_sumatra.json) kelompok kita. AI meneliti asal daerah, hukum adat larangan, hingga makna filosofis aslinya."
        },
        3: {
            label: "STEP 03 // DATA STRUCTURE",
            judul: "Structured JSON/CSV Output",
            deskripsi: "Riset narasi sejarah yang panjang dikunci menggunakan teknik Structured Prompt Engineering agar keluar murni menjadi baris kode variabel terstruktur. Data siap diekspor menjadi format kaku yang diakui standar ilmuwan komputer internasional."
        }
    };

    let lembarTerbaca = { 1: true, 2: false, 3: false };

    boxTertutup.onclick = () => {
        boxTertutup.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            boxTertutup.classList.add('hidden');
            boxTerbuka.classList.remove('hidden');
            setTimeout(() => {
                boxTerbuka.classList.add('opacity-100');
                updateVisualProgress();
            }, 50);
        }, 400);
    };

    const halamanList = [1, 2, 3];
    halamanList.forEach(num => {
        const btnPage = document.getElementById(`btn-page-${num}`);
        if (!btnPage) return;

        btnPage.onclick = () => {
            lembarTerbaca[num] = true;

            document.getElementById('label-halaman').innerText = datasetMajalah[num].label;
            document.getElementById('judul-halaman').innerText = datasetMajalah[num].judul;
            document.getElementById('deskripsi-halaman').innerText = datasetMajalah[num].deskripsi;

            halamanList.forEach(idx => {
                const b = document.getElementById(`btn-page-${idx}`);
                const frame = document.getElementById(`frame-visual-${idx}`);
                const dot = document.getElementById(`dot-step-${idx}`);

                // 👑 AMBIL ELEMEN ANIMASI MIKRO
                const microAnim = document.getElementById(`micro-anim-${idx}`);

                if (idx === num) {
                    b.className = "group/btn text-left p-3 rounded-xl bg-[#c5a059]/5 border border-[#c5a059] transition-all duration-300 shadow-inner";
                    b.querySelector('span:first-child').className = "block text-[8px] font-mono text-[#c5a059]";
                    b.querySelector('span:last-child').className = "block text-[11px] font-medium text-white";

                    if (frame) frame.classList.remove('hidden');

                    // 👑 Tampilkan animasi mikro yang sesuai dengan tab aktif
                    if (microAnim) {
                        microAnim.classList.remove('hidden');
                        microAnim.classList.add('flex');
                    }
                } else {
                    b.className = "group/btn text-left p-3 rounded-xl bg-transparent border border-white/5 hover:border-white/10 transition-all duration-300";
                    b.querySelector('span:first-child').className = "block text-[8px] font-mono text-gray-500";
                    b.querySelector('span:last-child').className = "block text-[11px] font-medium text-gray-400 group-hover/btn:text-white";

                    if (frame) frame.classList.add('hidden');

                    // 👑 Sembunyikan animasi mikro lainnya
                    if (microAnim) {
                        microAnim.classList.add('hidden');
                        microAnim.classList.remove('flex');
                    }
                }

                if (lembarTerbaca[idx] && dot && idx !== 1) {
                    dot.className = "w-6 h-6 rounded-full bg-[#c5a059] text-black font-mono text-[9px] font-bold flex items-center justify-center border border-[#c5a059]";
                }
            });

            updateVisualProgress();
        };
    });

    function updateVisualProgress() {
        let count = 0;
        if (lembarTerbaca[1]) count++;
        if (lembarTerbaca[2]) count++;
        if (lembarTerbaca[3]) count++;

        if (count === 1) progressBar.style.width = "0%";
        else if (count === 2) progressBar.style.width = "50%";
        else if (count === 3) progressBar.style.width = "100%";

        if (lembarTerbaca[1] && lembarTerbaca[2] && lembarTerbaca[3]) {
            infoQuest.innerText = "VALIDASI SUKSES: Dokumen pipeline terbuka. Akses penuh simulator diberikan!";
            infoQuest.className = "text-[10px] font-mono text-emerald-400 font-bold tracking-wide";

            if (iconWarning) {
                iconWarning.innerHTML = `<polyline points="20 6 9 17 4 12"></polyline>`;
                iconWarning.setAttribute('stroke', '#10b981');
            }

            btnLaboratorium.removeAttribute('disabled');
            btnLaboratorium.className = "w-full sm:w-auto bg-[#c5a059] text-black font-bold px-6 py-3.5 rounded-xl text-xs font-mono uppercase tracking-widest text-center shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:bg-white hover:scale-105 transition-all duration-500 pointer-events-auto";
            btnLaboratorium.innerHTML = "Masuk Halaman Laboratorium AI 🔓";
        }
    }
}