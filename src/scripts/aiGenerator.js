// src/scripts/aiGenerator.js
/**
 * aiGenerator.js
 * 
 * Modul ini digunakan untuk menginisialisasi halaman "AI Sandbox" pada aplikasi Nusantara Archival.
 * Berfungsi untuk memproses simulasi analisis pola batik menggunakan Vision AI, mencocokkan input dengan 
 * database internal, menampilkan visualisasi output data pada terminal interaktif, membuka halaman detail 
 * motif batik yang teridentifikasi, serta memfasilitasi ekspor metadata dalam format JSON atau CSV.
 */

export function initAiSandbox() {
    const rootEl = document.getElementById('ai-sandbox-root');
    const namaInput = document.getElementById('sandbox-nama-motif');
    const fileInput = document.getElementById('sandbox-file-gambar');
    const dropZone = document.getElementById('drop-zone');
    const btnGenerate = document.getElementById('btn-generate-ai');
    const terminal = document.getElementById('output-terminal-json');
    const statusMesin = document.getElementById('status-mesin');
    const areaExport = document.getElementById('area-export-btn');
    const dropText = document.getElementById('drop-text');

    // 👑 AMBIL ELEMENT TOMBOL BARU
    const btnGoToDetail = document.getElementById('btn-go-to-detail');

    if (!rootEl || !namaInput || !fileInput || !dropZone || !btnGenerate || !terminal || !statusMesin) return;

    // Ambil database asli dari data-attribute komponen Astro
    const databaseBatikAsli = JSON.parse(rootEl.getAttribute('data-database-batik') || '[]');

    let fileTerunggah = false;
    let dataHasilFinal = null;
    let currentBatikID = null; // Menyimpan ID batik yang aktif ditemukan

    // A. VALIDASI FORM
    function cekValiditasForm() {
        if (namaInput.value.trim().length > 0 && fileTerunggah) {
            btnGenerate.removeAttribute('disabled');
        } else {
            btnGenerate.setAttribute('disabled', 'true');
        }
    }

    namaInput.addEventListener('input', cekValiditasForm);

    // B. LOGIKA UPLOAD & DRAG DROP GAMBAR
    dropZone.onclick = (e) => { if (e.target !== fileInput) fileInput.click(); };
    fileInput.onchange = (e) => handleFile(e.target.files[0]);

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => {
        dropZone.addEventListener(name, (e) => e.preventDefault(), false);
    });
    dropZone.addEventListener('dragover', () => dropZone.classList.add('border-[#c5a059]/60', 'bg-[#c5a059]/5'));
    ['dragleave', 'drop'].forEach(name => dropZone.addEventListener(name, () => dropZone.classList.remove('border-[#c5a059]/60', 'bg-[#c5a059]/5')));
    dropZone.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]));

    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        fileTerunggah = true;
        if (dropText) {
            dropText.innerText = `📸 Berhasil memuat: ${file.name}`;
            dropText.classList.add('text-[#c5a059]');
        }
        cekValiditasForm();
    }

    // C. LOGIKA PEMROSESAN AI DENGAN VALIDASI DATABASE INTERNAL
    btnGenerate.onclick = () => {
        btnGenerate.setAttribute('disabled', 'true');
        if (areaExport) areaExport.classList.add('opacity-0', 'pointer-events-none');

        statusMesin.innerText = "VALIDATING";
        statusMesin.className = "text-[10px] font-mono text-cyan-400 uppercase tracking-wider";
        terminal.innerText = ">> Membuka jaringan otak Vision AI...\n>> Membaca input gambar dan mencocokkan teks nama motif...\n>> Melakukan validasi silang (cross-check) ke database internal...";

        const namaKetikUser = namaInput.value.toLowerCase().trim();

        setTimeout(() => {
            const dataDitemukan = databaseBatikAsli.find(item =>
                item.Nama && item.Nama.toLowerCase().trim().includes(namaKetikUser)
            );

            statusMesin.innerText = "WRITING DATA";
            statusMesin.className = "text-[10px] font-mono text-blue-400 uppercase tracking-wider";
            terminal.innerText = "";

            if (dataDitemukan) {
                // KONDISI A: JIKA DATA ADA DI DATABASE
                terminal.innerText = ">> [SUCCESS] Motif valid ditemukan di database lokal.\n>> Menyinkronkan output agar sesuai dengan berkas metadata utama...\n\n";

                // Amankan ID aslinya (misal: "alas_alasan" atau "becak_medan") untuk keperluan routing nanti
                currentBatikID = dataDitemukan.ID;

                dataHasilFinal = {
                    "id": dataDitemukan.ID || "generated_id",
                    "nama_motif": dataDitemukan.Nama,
                    "provinsi": dataDitemukan.Provinsi || "Tidak Diketahui",
                    "kategori_budaya": dataDitemukan["Kategori Budaya"] || "Batik Klasik",
                    "fungsi_tradisional": dataDitemukan["Fungsi Tradisional"] || "Pakaian Adat",
                    "status_simbolik": dataDitemukan["Status Simbolik"] || "Umum",
                    "warna_dominan": dataDitemukan["Warna Dominan"] || "Multi-warna",
                    "makna_filosofis": dataDitemukan["Makna Filosofis"] || "Tidak ada deskripsi makna.",
                    "fakta_unik": dataDitemukan["Fakta Unik"] || "Motif bernilai sejarah tinggi.",
                    "elemen_visual": dataDitemukan["Elemen Visual"] || "Stilasi ragam hias tradisional."
                };

                // 👑 SUNTIKAN VISUAL: Karena sukses ada di database, tombol "Lihat Detail" kita tampilkan utuh
                if (btnGoToDetail) btnGoToDetail.style.display = "inline-flex";

            } else {
                // KONDISI B: JIKA MOTIF BARU (TIDAK ADA DI DATASET LOKAL)
                terminal.innerText = ">> [WARNING] Motif tidak terdaftar di database internal.\n>> Memicu Google Gemini Vision API untuk ekstraksi data global luar...\n\n";

                currentBatikID = null; // Reset karena data luar gak punya halaman detail lokal

                const deskripsiVariasi = [
                    `Ini adalah hasil deskripsi otomatis AI untuk motif "${namaInput.value}". Motif ini dianalisis secara eksternal berdasarkan kemiripan pola visual gambar yang diunggah dengan arsip kebudayaan digital global.`,
                    `Analisis kecerdasan buatan mendeteksi karakteristik visual dari motif "${namaInput.value}". Makna filosofis belum terdefinisi secara resmi dalam database lokal, namun struktur geometrisnya menunjukkan keterkaitan dengan ragam hias modern.`,
                    `Motif "${namaInput.value}" diproses secara otomatis oleh Vision AI. Penafsiran simbolik dilakukan dengan mencocokkan kemiripan bentuk visual secara global, mencerminkan eksplorasi seni rupa kontemporer.`
                ];
                const maknaTerpilih = deskripsiVariasi[Math.floor(Math.random() * deskripsiVariasi.length)];

                dataHasilFinal = {
                    "id": namaKetikUser.replace(/\s+/g, '_'),
                    "nama_motif": namaInput.value,
                    "provinsi": "Hasil Analisis Visi AI (Luar)",
                    "kategori_budaya": "Deteksi Eksternal",
                    "fungsi_tradisional": "Kain Busana Modern / Umum",
                    "status_simbolik": "Non-Tradisional",
                    "warna_dominan": "Mengekstrak dari Gambar...",
                    "makna_filosofis": maknaTerpilih,
                    "fakta_unik": "Berhasil diproses sebagai data entri baru di luar dataset utama.",
                    "elemen_visual": "Guratan geometri/organis yang terdeteksi oleh sistem komputer vision."
                };

                // 👑 SUNTIKAN VISUAL: Karena ini data luar (belum punya page detail di web kita), sembunyikan tombolnya biar gak eror 404
                if (btnGoToDetail) btnGoToDetail.style.display = "none";
            }

            const teksFull = JSON.stringify(dataHasilFinal, null, 2);
            let index = 0;

            function ketikKode() {
                if (index < teksFull.length) {
                    terminal.innerText += teksFull.charAt(index);
                    index += 4;
                    requestAnimationFrame(ketikKode);
                } else {
                    terminal.innerText = terminal.innerText.split('\n\n')[0] + '\n\n' + teksFull;
                    statusMesin.innerText = "SUCCESS";
                    statusMesin.className = "text-[10px] font-mono text-emerald-500 uppercase tracking-wider";
                    if (areaExport) areaExport.classList.remove('opacity-0', 'pointer-events-none');
                    btnGenerate.removeAttribute('disabled');
                }
            }
            ketikKode();

        }, 2000);
    };

    // 👑 UPDATE RUTE DETAIL SESUAI ALAMAT ASLI KELOMPOK KOMANG
    if (btnGoToDetail) {
        btnGoToDetail.onclick = () => {
            if (!currentBatikID) return;

            // Menggunakan format rute /detail/[id] sesuai struktur asli localhost kamu
            const urlDetail = `/detail/${currentBatikID}`;

            // Buka halaman di tab baru secara bersih
            window.open(urlDetail, '_blank');
        };
    }

    // D. LOGIKA UNDUH FILE
    const btnJson = document.getElementById('btn-export-json');
    const btnCsv = document.getElementById('btn-export-csv');

    if (btnJson) {
        btnJson.onclick = () => {
            if (!dataHasilFinal) return;
            const blob = new Blob([JSON.stringify(dataHasilFinal, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `metadata_${dataHasilFinal.id}.json`;
            a.click();
        };
    }

    if (btnCsv) {
        btnCsv.onclick = () => {
            if (!dataHasilFinal) return;
            const headers = Object.keys(dataHasilFinal).join(',');
            const values = Object.values(dataHasilFinal).map(val => `"${val.toString().replace(/"/g, '""')}"`).join(',');
            const csvContent = `${headers}\n${values}`;
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `metadata_${dataHasilFinal.id}.csv`;
            a.click();
        };
    }
}