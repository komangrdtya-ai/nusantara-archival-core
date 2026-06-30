// src/scripts/test-koleksi.js

function initTestKoleksiBatik() {
    const currentPath = window.location.pathname;
    const previousPath = sessionStorage.getItem('global_prev_path') || '';
    const gridArea = document.getElementById('area-galeri-testing');

    if (gridArea) {
        if (previousPath && !previousPath.includes('/detail') && !previousPath.includes('/test') && previousPath !== currentPath) {
            let defaultState = { search: '', provinsi: 'semua', budaya: 'semua', simbolik: 'semua', warna: [], format: 'semua', rights: 'semua', language: 'semua', source: 'semua', urutan: 'default' };
            sessionStorage.setItem('koleksi_state_v2', JSON.stringify(defaultState));
            sessionStorage.setItem('sidebar_active_state_v2', 'false');
        }

        setupSuperSearchAndFilters();
    }

    sessionStorage.setItem('global_prev_path', currentPath);
}

document.addEventListener('DOMContentLoaded', initTestKoleksiBatik);
document.addEventListener('astro:page-load', initTestKoleksiBatik);


function setupSuperSearchAndFilters() {
    const ITEMS_PER_PAGE = 9; // Batasan jumlah kartu per halaman
    let defaultState = { search: '', provinsi: 'semua', budaya: 'semua', simbolik: 'semua', warna: [], format: 'semua', rights: 'semua', language: 'semua', source: 'semua', urutan: 'default', halamanSekarang: 1 };
    let isFirstLoad = true;

    let state = JSON.parse(sessionStorage.getItem('koleksi_state_v2')) || defaultState;
    if (!state.halamanSekarang) state.halamanSekarang = 1;

    let isSidebarActive = sessionStorage.getItem('sidebar_active_state_v2') === 'true';

    const cards = document.querySelectorAll('.kartu-motif-test');
    const dashboardTotal = document.getElementById('dashboard-total-motif');
    const statusText = document.getElementById('teks-status-filter');

    const searchContainer = document.getElementById('search-filter-container');
    const inputPencarian = document.getElementById('input-pencarian-batik');
    const btnClearSearch = document.getElementById('btn-clear-search');
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');

    const mainLayoutContainer = document.getElementById('main-layout-container');
    const wrapperGaleri = document.getElementById('wrapper-galeri');
    const wrapperSidebar = document.getElementById('wrapper-sidebar');
    const gridArea = document.getElementById('area-galeri-testing');

    const selectSort = document.getElementById('sort-abjad');

    const urlParams = new URLSearchParams(window.location.search);
    const idAsalKain = urlParams.get('asal');
    
    // Sinkronisasi input pencarian
    if (inputPencarian) inputPencarian.value = state.search;
    if (selectSort) selectSort.value = state.urutan;

    if (inputPencarian) {
        // Logika untuk menampilkan/menyembunyikan tombol clear
        function updateClearButton() {
            if (!btnClearSearch) return;
            if (inputPencarian.value.length > 0) {
                btnClearSearch.classList.remove('opacity-0', 'scale-75', 'pointer-events-none');
                btnClearSearch.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
            } else {
                btnClearSearch.classList.add('opacity-0', 'scale-75', 'pointer-events-none');
                btnClearSearch.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
            }
        }

        // Inisialisasi awal
        updateClearButton();

        let debounceTimer;

        // Saat diketik
        inputPencarian.addEventListener('input', (e) => {
            state.search = e.target.value.toLowerCase().trim();
            state.halamanSekarang = 1; // Reset halaman saat mencari
            sessionStorage.setItem('koleksi_state_v2', JSON.stringify(state));
            updateClearButton();
            
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                runFilter();
            }, 300);
        });

        // Mencegah input kehilangan fokus saat mengklik tombol clear
        if (btnClearSearch) {
            btnClearSearch.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Mencegah tombol mengambil fokus
            });

            btnClearSearch.addEventListener('click', () => {
                inputPencarian.value = '';
                state.search = '';
                state.halamanSekarang = 1;
                sessionStorage.setItem('koleksi_state_v2', JSON.stringify(state));
                updateClearButton();
                runFilter();
                inputPencarian.focus(); // Pastikan tetap fokus
            });
        }
    }
    
    
    function terapkanLayoutVisualSidebar() {
        if (!mainLayoutContainer || !wrapperSidebar || !wrapperGaleri || !gridArea || !btnToggleSidebar) return;
        
        const accordion = document.getElementById('sidebar-content-accordion');

        if (isSidebarActive) {
            if (accordion) {
                accordion.style.gridTemplateRows = '1fr';
                accordion.style.opacity = '1';
                setTimeout(() => accordion.classList.add('is-active'), 50);
            }

            if (document.getElementById('teks-toggle-filter')) document.getElementById('teks-toggle-filter').innerText = 'Filter Arsip Spesifik';
            if (document.getElementById('icon-toggle-filter')) document.getElementById('icon-toggle-filter').innerText = '-';
        } else {
            if (accordion) {
                accordion.classList.remove('is-active');
                accordion.style.gridTemplateRows = '0fr';
                accordion.style.opacity = '0';
            }

            if (document.getElementById('teks-toggle-filter')) document.getElementById('teks-toggle-filter').innerText = 'Filter Arsip Spesifik';
            if (document.getElementById('icon-toggle-filter')) document.getElementById('icon-toggle-filter').innerText = '+';
        }
    }

    function paksaBukaSidebar() {
        if (isSidebarActive) return;
        isSidebarActive = true;
        sessionStorage.setItem('sidebar_active_state_v2', 'true');
        terapkanLayoutVisualSidebar();
    }

    terapkanLayoutVisualSidebar();

    // Filter Sidebar Mobile
    document.getElementById('btn-reset-filter-mobile')?.addEventListener('click', () => {
        let isFiltered = state.provinsi !== 'semua' || state.budaya !== 'semua' || state.simbolik !== 'semua' || state.warna.length > 0 || state.format !== 'semua' || state.rights !== 'semua' || state.language !== 'semua' || state.source !== 'semua';
        
        if (isFiltered) {
            showPremiumToast('Filter Dibersihkan', 'Semua filter pencarian telah di-reset.', 'info');
        }

        state.provinsi = 'semua';
        state.budaya = 'semua';
        state.simbolik = 'semua';
        state.warna = [];
        state.format = 'semua';
        state.rights = 'semua';
        state.language = 'semua';
        state.source = 'semua';
        runFilter();
    });


    if (btnToggleSidebar) {
        const newBtnToggle = btnToggleSidebar.cloneNode(true);
        btnToggleSidebar.replaceWith(newBtnToggle);
        newBtnToggle.addEventListener('click', () => {
            isSidebarActive = !isSidebarActive;
            sessionStorage.setItem('sidebar_active_state_v2', isSidebarActive ? 'true' : 'false');
            terapkanLayoutVisualSidebar();
        });
    }

    // Arsip Teknis Toggle Logic
    const btnToggleArsip = document.getElementById('btn-toggle-arsip-teknis');
    const wadahArsip = document.getElementById('wadah-arsip-teknis');
    const iconArsip = document.getElementById('icon-arsip-teknis');
    
    if (btnToggleArsip && wadahArsip && iconArsip) {
        let isArsipTerbuka = sessionStorage.getItem('arsip_teknis_state') === 'true';
        
        function updateVisualArsip() {
            const innerDiv = wadahArsip.querySelector('div');
            if (isArsipTerbuka) {
                wadahArsip.style.gridTemplateRows = '1fr';
                wadahArsip.style.opacity = '1';
                setTimeout(() => wadahArsip.classList.add('is-active'), 50);
                setTimeout(() => { if (innerDiv) innerDiv.style.overflow = 'visible'; }, 800);
                iconArsip.innerText = '-';
            } else {
                if (innerDiv) innerDiv.style.overflow = 'hidden';
                wadahArsip.classList.remove('is-active');
                wadahArsip.style.gridTemplateRows = '0fr';
                wadahArsip.style.opacity = '0';
                iconArsip.innerText = '+';
            }
        }
        
        updateVisualArsip();
        
        const newBtnArsip = btnToggleArsip.cloneNode(true);
        btnToggleArsip.replaceWith(newBtnArsip);
        newBtnArsip.addEventListener('click', () => {
            isArsipTerbuka = !isArsipTerbuka;
            sessionStorage.setItem('arsip_teknis_state', isArsipTerbuka ? 'true' : 'false');
            const curIconArsip = document.getElementById('icon-arsip-teknis');
            const innerDiv = wadahArsip.querySelector('div');
            if (isArsipTerbuka) {
                wadahArsip.style.gridTemplateRows = '1fr';
                wadahArsip.style.opacity = '1';
                setTimeout(() => wadahArsip.classList.add('is-active'), 50);
                setTimeout(() => { if (innerDiv) innerDiv.style.overflow = 'visible'; }, 800);
                if(curIconArsip) curIconArsip.innerText = '-';
            } else {
                if (innerDiv) innerDiv.style.overflow = 'hidden';
                wadahArsip.classList.remove('is-active');
                wadahArsip.style.gridTemplateRows = '0fr';
                wadahArsip.style.opacity = '0';
                if(curIconArsip) curIconArsip.innerText = '+';
            }
        });
    }

    // Dropdown Logic
    const triggers = document.querySelectorAll('.custom-select-trigger');
    function closeAll() {
        document.querySelectorAll('.custom-options-box').forEach(box => box.classList.add('hidden'));
        document.querySelectorAll('.panah-icon').forEach(p => p.style.transform = 'rotate(0deg)');
        document.querySelectorAll('.filter-group').forEach(fg => fg.style.zIndex = '');
    }

    triggers.forEach(trigger => {
        trigger.replaceWith(trigger.cloneNode(true));
        const newTrigger = document.getElementById(trigger.id);
        if (newTrigger) {
            newTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const box = newTrigger.nextElementSibling;
                const isHidden = box.classList.contains('hidden');
                closeAll();
                if (isHidden) {
                    box.classList.remove('hidden');
                    newTrigger.querySelector('.panah-icon').style.transform = 'rotate(180deg)';
                    const fg = newTrigger.closest('.filter-group');
                    if (fg) fg.style.zIndex = '50';
                }
            });
        }
    });

    document.addEventListener('click', closeAll);
    document.querySelectorAll('.custom-options-box').forEach(box => { box.addEventListener('click', e => e.stopPropagation()); });

    // Sorting Logic
    function eksekusiSortingAbjad() {
        if (!gridArea || !state.urutan) return;
        
        // JANGAN KOCOK ULANG DOM pada load pertama jika urutannya default,
        // karena HTML dari Astro sudah diurutkan (mencegah animasi bergeser aneh ke kanan antar kolom).
        if (isFirstLoad && state.urutan === 'default') return;

        const arrayCards = Array.from(cards);

        if (state.urutan === 'default') {
            arrayCards.sort((a, b) => a.getAttribute('data-id').localeCompare(b.getAttribute('data-id')));
        } else {
            arrayCards.sort((a, b) => {
                const namaA = (a.getAttribute('data-nama') || '').toLowerCase();
                const namaB = (b.getAttribute('data-nama') || '').toLowerCase();
                if (state.urutan === 'az') return namaA.localeCompare(namaB);
                if (state.urutan === 'za') return namaB.localeCompare(namaA);
                return 0;
            });
        }
        arrayCards.forEach(card => gridArea.appendChild(card));
    }

    if (selectSort) {
        selectSort.removeEventListener('change', () => { });
        selectSort.addEventListener('change', (e) => {
            state.urutan = e.target.value;
            state.halamanSekarang = 1; // Reset halaman ke 1 saat mengganti urutan
            sessionStorage.setItem('koleksi_state_v2', JSON.stringify(state));
            eksekusiSortingAbjad();
            runFilter();
        });
    }

    // Main Filtering Logic
    function runFilter() {
        let matchedCards = [];
        let liveCounts = { provinsi: {}, budaya: {}, simbolik: {}, warna: {}, format: {}, rights: {}, language: {}, source: {} };

        const sedangSorting = state.urutan === 'az' || state.urutan === 'za';

        if (idAsalKain && !sedangSorting) {
            const idTarget = idAsalKain.replace('test_', '').replace('detail_', '');
            const kartuAsal = document.querySelector(`.kartu-motif-test[data-id="${idTarget}"]`);
            if (kartuAsal && kartuAsal.parentElement) {
                kartuAsal.parentElement.prepend(kartuAsal);
            }
        }

        const liveCards = gridArea.querySelectorAll('.kartu-motif-test');
        liveCards.forEach(card => {
            const namaKain = card.getAttribute('data-nama');
            const p = card.getAttribute('data-provinsi');
            const b = card.getAttribute('data-budaya');
            const s = card.getAttribute('data-simbolik');
            const w = card.getAttribute('data-warna');
            const f = card.getAttribute('data-format');
            const r = card.getAttribute('data-rights');
            const l = card.getAttribute('data-language');
            const o = card.getAttribute('data-source');
            const idKainSekarang = card.getAttribute('data-id') || card.id;

            const matchSearch = state.search === '' ||
                (namaKain && namaKain.includes(state.search)) ||
                (p && p.toLowerCase().includes(state.search)) ||
                (w && w.toLowerCase().includes(state.search));

            const matchP = state.provinsi === 'semua' || p === state.provinsi;
            const matchB = state.budaya === 'semua' || b === state.budaya;
            const matchS = state.simbolik === 'semua' || s === state.simbolik;
            const matchF = state.format === 'semua' || f === state.format;
            const matchR = state.rights === 'semua' || r === state.rights;
            const matchO = state.source === 'semua' || o === state.source;
            const matchL = state.language === 'semua' || (l && l.split(',').map(x=>x.trim()).includes(state.language));

            const matchW = state.warna.length === 0 || state.warna.some(color => {
                if (!w) return false;
                return w.toLowerCase().split(',').some(warnaRaw => {
                    const namaWarnaSaja = warnaRaw.split('(')[0].trim();
                    return namaWarnaSaja === color.toLowerCase();
                });
            });

            const criteria = {
                search: matchSearch,
                provinsi: matchP,
                budaya: matchB,
                simbolik: matchS,
                warna: matchW,
                format: matchF,
                rights: matchR,
                language: matchL,
                source: matchO
            };

            const isMatch = Object.values(criteria).every(Boolean);

            if (isMatch) {
                matchedCards.push({ card, idKainSekarang, dots: card.querySelectorAll('.swatch-titik-warna') });
            } else {
                card.classList.add('kartu-hilang');
                card.style.display = 'none'; // Sembunyikan langsung untuk efisiensi
            }

            // HITUNG DINAMIS (Hanya tambahkan jika cocok dengan SEMUA KRITERIA LAIN)
            const matchExcept = (excludeKey) => Object.entries(criteria).every(([k, v]) => k === excludeKey || v);

            if (matchExcept('provinsi') && p) liveCounts.provinsi[p] = (liveCounts.provinsi[p] || 0) + 1;
            if (matchExcept('budaya') && b) liveCounts.budaya[b] = (liveCounts.budaya[b] || 0) + 1;
            if (matchExcept('simbolik') && s) liveCounts.simbolik[s] = (liveCounts.simbolik[s] || 0) + 1;
            if (matchExcept('format') && f) liveCounts.format[f] = (liveCounts.format[f] || 0) + 1;
            if (matchExcept('rights') && r) liveCounts.rights[r] = (liveCounts.rights[r] || 0) + 1;
            if (matchExcept('source') && o) liveCounts.source[o] = (liveCounts.source[o] || 0) + 1;
            
            if (matchExcept('language') && l) {
                l.split(',').forEach(lang => {
                    const langClean = lang.trim();
                    if(langClean) liveCounts.language[langClean] = (liveCounts.language[langClean] || 0) + 1;
                });
            }

            if (matchExcept('warna')) {
                document.querySelectorAll('#opsi-warna .baris-opsi').forEach(btn => {
                    const t = btn.getAttribute('data-target');
                    if (t !== 'semua' && w) {
                        const isTargetMatch = w.toLowerCase().split(',').some(warnaRaw => {
                            const namaWarnaSaja = warnaRaw.split('(')[0].trim();
                            return namaWarnaSaja === t.toLowerCase();
                        });
                        if (isTargetMatch) {
                            liveCounts.warna[t] = (liveCounts.warna[t] || 0) + 1;
                        }
                    }
                });
            }
        });
        isFirstLoad = false;

        if (dashboardTotal) dashboardTotal.innerText = matchedCards.length;

        // PRIORITASKAN MOTIF ASAL (Jika ada idAsalKain, taruh dia di urutan paling pertama agar selalu masuk Halaman 1)
        const unmatchedCards = Array.from(liveCards).filter(c => !matchedCards.some(m => m.card === c));
        unmatchedCards.forEach(card => {
            card.style.display = 'none';
            card.classList.add('kartu-missing');
        });

        const text = state.search.toLowerCase();
        if (text && matchedCards.length > 0) {
            matchedCards.sort((a, b) => {
                const titleA = (a.card.getAttribute('data-nama') || '').toLowerCase();
                const titleB = (b.card.getAttribute('data-nama') || '').toLowerCase();
                
                const aExact = titleA === text;
                const bExact = titleB === text;
                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;

                const aStarts = titleA.startsWith(text);
                const bStarts = titleB.startsWith(text);
                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;

                return 0;
            });
        } else if (idAsalKain && !sedangSorting) {
            const idTarget = idAsalKain.replace('test_', '').replace('detail_', '');
            const indexAsal = matchedCards.findIndex(m => m.card.getAttribute('data-id') === idTarget);
            if (indexAsal > 0) {
                const itemAsal = matchedCards.splice(indexAsal, 1)[0];
                matchedCards.unshift(itemAsal);
            }
        }

        // ==== PAGINATION LOGIC ====
        const totalPages = Math.ceil(matchedCards.length / ITEMS_PER_PAGE);
        if (state.halamanSekarang > totalPages && totalPages > 0) state.halamanSekarang = totalPages;

        const startIndex = (state.halamanSekarang - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedCards = matchedCards.slice(startIndex, endIndex);

        let delay = 0;
        matchedCards.forEach(({ card, idKainSekarang, dots }) => {
            const isPaginated = paginatedCards.some(p => p.card === card);
            
            if (isPaginated) {
                card.style.display = 'flex';
                card.classList.remove('kartu-missing', 'kartu-hilang');
                
                // Re-trigger CSS animation if it's not the first load (e.g. user is filtering/paginating)
                if (!isFirstLoad) {
                    card.style.animation = 'none';
                    card.offsetHeight; // Force reflow
                    card.style.animation = '';
                    card.style.animationDelay = `${delay}ms`;
                    card.classList.add('animate-fade-up-motif');
                    delay += 75;
                }

                if (state.warna.length > 0) {
                    dots.forEach(dot => {
                        const dotName = dot.getAttribute('data-warna-nama');
                        dot.style.display = state.warna.some(c => c.toLowerCase() === dotName) ? 'block' : 'none';
                    });
                } else {
                    dots.forEach(dot => dot.style.display = 'block');
                }

                card.style.cursor = 'pointer';
                card.onclick = (e) => {
                    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.btn-kembali-cepat')) return;
                    if (idKainSekarang) {
                        const a = document.createElement('a');
                        const base = window.BASE_URL || '';
                        a.href = `${base}/detail/${idKainSekarang}`; // Redirect back to detail page
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }
                };

                if (idAsalKain && idKainSekarang === idAsalKain.replace('test_', '').replace('detail_', '')) {
                    if (!card.querySelector('.btn-kembali-cepat')) {
                        const btnKembali = document.createElement('div');
                        btnKembali.className = "btn-kembali-cepat absolute top-2 right-2 z-30 bg-[#a67c00] text-black text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-lg border border-black/10 hover:bg-white hover:scale-105 transition-all duration-300 cursor-pointer";
                        btnKembali.innerHTML = `<span>← Kembali ke Detail (Clear Filter)</span>`;
                        btnKembali.onclick = (e) => {
                            e.stopPropagation();
                            let defaultState = { search: '', provinsi: 'semua', budaya: 'semua', simbolik: 'semua', warna: [], format: 'semua', rights: 'semua', language: 'semua', source: 'semua', urutan: 'default', halamanSekarang: 1 };
                            sessionStorage.setItem('koleksi_state_v2', JSON.stringify(defaultState));
                            sessionStorage.setItem('sidebar_active_state_v2', 'false');

                            const a = document.createElement('a');
                            const base = window.BASE_URL || '';
                            if (idAsalKain.startsWith('test_') || idAsalKain.startsWith('detail_')) {
                                const idTarget = idAsalKain.replace('test_', '').replace('detail_', '');
                                a.href = `${base}/detail/${idTarget}`;
                            } else {
                                a.href = `${base}/detail/${idAsalKain}`;
                            }
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        };
                        card.classList.add('relative');
                        card.appendChild(btnKembali);
                    }
                }

                // GLOWING TITIK WARNA
                if (state.warna.length === 0) {
                    dots.forEach(titik => {
                        titik.classList.remove('swatch-aktif', 'swatch-redup');
                        titik.style = `background-color: ${titik.style.backgroundColor}; display: block;`;
                    });
                } else {
                    dots.forEach(titik => {
                        const namaTitik = titik.getAttribute('data-warna-nama') || '';
                        const isColorMatch = state.warna.some(w => namaTitik === w.toLowerCase());
                        titik.style = `background-color: ${titik.style.backgroundColor}`;

                        if (isColorMatch) {
                            titik.classList.add('swatch-aktif');
                            titik.classList.remove('swatch-redup');
                            titik.style.display = 'block';
                        } else {
                            titik.classList.add('swatch-redup');
                            titik.classList.remove('swatch-aktif');
                            titik.style.display = 'none';
                        }
                    });
                }
            } else {
                card.classList.add('kartu-hilang');
                card.style.display = 'none';
            }
        });
        
        const isFilterActive = Object.entries(state).some(([k, v]) => {
            if(k === 'search' || k === 'urutan') return false;
            if(k === 'warna') return v.length > 0;
            return v !== 'semua';
        }) || state.search !== '';

        if (statusText) {
            if (state.search !== '') {
                statusText.innerText = `Menemukan kata kunci: "${state.search}"`; statusText.classList.add('text-[#c5a059]');
            } else {
                statusText.innerText = isFilterActive ? "Filter spesifik diterapkan" : "Menampilkan seluruh database"; statusText.classList.remove('text-[#c5a059]');
            }
        }

        ['provinsi', 'budaya', 'simbolik', 'warna', 'format', 'rights', 'language', 'source'].forEach(kategori => {
            const box = document.getElementById(`opsi-${kategori}`);
            if (!box) return;
            box.querySelectorAll('.baris-opsi').forEach(btn => {
                const target = btn.getAttribute('data-target');
                if (target === 'semua') return;
                const num = liveCounts[kategori][target] || 0;
                const labelAngka = btn.querySelector('.angka-opsi');
                if (labelAngka) labelAngka.innerText = num;
                btn.style.display = num > 0 ? 'flex' : 'none';
                if (kategori === 'warna') { if (state.warna.includes(target)) btn.classList.add('aktif'); else btn.classList.remove('aktif'); }
                else { if (state[kategori] === target) btn.classList.add('aktif'); else btn.classList.remove('aktif'); }
            });
        });

        renderAllPills();
        renderPaginationUI(totalPages);
    }

    function renderPaginationUI(totalPages) {
        const container = document.getElementById('pagination-container');
        if (!container) return;
        container.innerHTML = '';
        
        if (totalPages <= 1) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'flex';

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `w-10 h-10 rounded-full font-serif font-bold transition-all duration-300 flex items-center justify-center border hover:scale-110 focus:outline-none ` + 
                (i === state.halamanSekarang 
                    ? `bg-[#c5a059] text-black border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.5)] cursor-default` 
                    : `bg-[#111] text-gray-400 border-gray-700 hover:border-[#c5a059] hover:text-[#c5a059] cursor-pointer shadow-lg`);
            btn.innerText = i;
            
            if (i !== state.halamanSekarang) {
                btn.onclick = () => {
                    state.halamanSekarang = i;
                    sessionStorage.setItem('koleksi_state_v2', JSON.stringify(state));
                    runFilter();
                    
                    const wrapper = document.getElementById('wrapper-galeri');
                    if (wrapper) {
                        const yOffset = -120; 
                        const y = wrapper.getBoundingClientRect().top + window.scrollY + yOffset;
                        window.scrollTo({top: y, behavior: 'smooth'});
                    }
                };
            }
            container.appendChild(btn);
        }
    }

    function renderAllPills() {
        ['provinsi', 'budaya', 'simbolik', 'warna', 'format', 'rights', 'language', 'source'].forEach(kategori => {
            const container = document.getElementById(`pills-${kategori}`);
            if (!container) return;
            container.innerHTML = "";
            const createPill = (item) => {
                const pill = document.createElement('div');
                let visualHTML = `<span class="text-[11px] text-gray-200 font-medium line-clamp-1 max-w-[150px]">${item}</span>`;
                if (kategori === 'warna') {
                    const btnAsli = document.querySelector(`#opsi-warna [data-target="${item}"]`);
                    const hex = btnAsli?.getAttribute('data-hex') || '#555';
                    visualHTML = `<div class="w-3 h-3 rounded-full shadow-sm" style="background-color: ${hex}; border: 1px solid rgba(255,255,255,0.1)"></div><span class="text-[11px] text-gray-200 font-medium truncate max-w-[120px]">${item}</span>`;
                }
                pill.className = "hover-badge-alive inline-flex items-center justify-between gap-2.5 pl-3 pr-1.5 py-1.5 bg-[#1e1e1e] border border-gray-700 rounded-full shadow-sm animate-[fadeInScale_0.2s_ease] transition-colors hover:border-gray-500";
                pill.innerHTML = `<div class="flex items-center gap-2">${visualHTML}</div><button type="button" class="btn-hapus-pill flex items-center justify-center w-[18px] h-[18px] rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-500 transition-colors cursor-pointer" title="Hapus Filter"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>`;
                pill.querySelector('.btn-hapus-pill').addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (kategori === 'warna') { state.warna = state.warna.filter(i => i !== item); } else { state[kategori] = 'semua'; }
                    state.halamanSekarang = 1;
                    sessionStorage.setItem('koleksi_state_v2', JSON.stringify(state));
                    runFilter();
                });
                container.appendChild(pill);
            };
            if (kategori === 'warna') { state.warna.forEach(item => createPill(item)); }
            else { if (state[kategori] !== 'semua') createPill(state[kategori]); }
        });
    }

        // Fungsi Toast Interaktif Premium (General)
        function showPremiumToast(title, message, type = 'warning') {
            const existingToast = document.getElementById('premium-toast-warning');
            if (existingToast) existingToast.remove();
    
            const toast = document.createElement('div');
            toast.id = 'premium-toast-warning';
            
            const isLightMode = document.documentElement.classList.contains('light-mode');
            
            toast.className = `fixed bottom-10 left-1/2 transform -translate-x-1/2 px-5 py-4 rounded-2xl z-[9999] flex items-center gap-4 backdrop-blur-xl border transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] scale-90 translate-y-12 opacity-0 cursor-pointer shadow-2xl`;
            
            let iconSvg = '';
            let titleColor = isLightMode ? 'text-[#b08d4b]' : 'text-[#c5a059]';
            let iconBg = isLightMode ? 'rgba(176, 141, 75, 0.15)' : 'rgba(197, 160, 89, 0.15)';

            if (type === 'warning') {
                iconSvg = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>`;
            } else if (type === 'info') {
                // Ikon tempat sampah / bersihkan
                iconSvg = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>`;
            } else if (type === 'success') {
                iconSvg = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>`;
            }

            if(isLightMode) {
                 toast.style.backgroundColor = 'rgba(235, 228, 216, 0.85)';
                 toast.style.borderColor = 'rgba(176, 141, 75, 0.4)';
                 toast.style.color = '#1a1a1a';
                 toast.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.15)';
            } else {
                 toast.style.backgroundColor = 'rgba(15, 15, 15, 0.85)';
                 toast.style.borderColor = 'rgba(197, 160, 89, 0.3)';
                 toast.style.color = '#fff';
                 toast.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.6)';
            }
    
            toast.innerHTML = `
                <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110" style="background: ${iconBg}">
                    <svg class="w-5 h-5 ${titleColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        ${iconSvg}
                    </svg>
                </div>
                <div class="flex flex-col">
                    <h4 class="font-serif text-[15px] font-bold tracking-wide ${titleColor} leading-none mb-1">${title}</h4>
                    <p class="text-[13px] font-sans opacity-80 leading-snug">${message}</p>
                </div>
            `;
    
            document.body.appendChild(toast);
    
            // Animasi masuk (muncul dengan pantulan)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    toast.classList.remove('scale-90', 'translate-y-12', 'opacity-0');
                    toast.classList.add('scale-100', 'translate-y-0', 'opacity-100');
                });
            });
    
            // Fungsi menutup toast
            const dismissToast = () => {
                toast.classList.remove('scale-100', 'translate-y-0', 'opacity-100');
                toast.classList.add('scale-90', 'translate-y-12', 'opacity-0');
                setTimeout(() => toast.remove(), 500);
            };
    
            // Hilangkan jika diklik
            toast.addEventListener('click', dismissToast);
    
            // Hilangkan otomatis setelah 4 detik
            setTimeout(() => {
                if (document.body.contains(toast)) dismissToast();
            }, 4000);
        }

    document.querySelectorAll('.baris-opsi').forEach(btn => { btn.replaceWith(btn.cloneNode(true)); });
    document.querySelectorAll('.baris-opsi').forEach(btn => {
        btn.addEventListener('click', () => {
            const kategori = btn.getAttribute('data-kategori');
            const target = btn.getAttribute('data-target');
            if (kategori === 'warna') {
                if (target === 'semua') { 
                    if (state.warna.length > 0) {
                        showPremiumToast('Filter Dibersihkan', 'Semua warna pilihan telah di-reset.', 'info');
                    }
                    state.warna = []; 
                    closeAll(); 
                }
                else {
                    if (state.warna.includes(target)) { state.warna = state.warna.filter(i => i !== target); }
                    else { 
                        if (state.warna.length >= 6) { 
                            showPremiumToast('Peringatan Kuota', 'Anda maksimal hanya bisa mencampur 6 warna sekaligus!', 'warning'); 
                            return; 
                        } 
                        state.warna.push(target); 
                    }
                }
            } else {
                if (target === 'semua' && state[kategori] !== 'semua') {
                    showPremiumToast('Filter Dibersihkan', 'Filter kategori ini telah di-reset.', 'info');
                }
                state[kategori] = target; closeAll();
            }

            state.halamanSekarang = 1;
            sessionStorage.setItem('koleksi_state_v2', JSON.stringify(state));
            runFilter();
        });
    });

    const qParams = new URLSearchParams(window.location.search);
    let adaQueryEksternal = false;
    
    ['provinsi', 'budaya', 'simbolik', 'format', 'rights', 'language', 'source'].forEach(k => {
        const q = qParams.get(k);
        if(q) { state[k] = q; adaQueryEksternal = true; }
    });
    
    const qWarna = qParams.get('warna');
    if (qWarna) {
        if (!state.warna.includes(qWarna)) state.warna.push(qWarna);
        adaQueryEksternal = true;
    }

    if (adaQueryEksternal) {
        state.halamanSekarang = 1;
        sessionStorage.setItem('koleksi_state_v2', JSON.stringify(state));
        paksaBukaSidebar();
        
        // Gulir ke atas otomatis
        setTimeout(() => {
            const wrapper = document.getElementById('wrapper-galeri');
            if (wrapper) {
                const yOffset = -120;
                const y = wrapper.getBoundingClientRect().top + window.scrollY + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
            }
        }, 300);
    }

    // Tunda eksekusi DOM berat agar tidak memblokir render animasi View Transitions (menyelesaikan patah-patah/stutter)
    setTimeout(() => {
        eksekusiSortingAbjad();
        runFilter();
    }, 50);
}

// Perbaiki Animasi View Transitions saat kembali ke Koleksi
document.addEventListener('astro:before-swap', (ev) => {
    const url = ev.to;
    if (url.pathname.includes('/koleksi')) {
        const asal = url.searchParams.get('asal');
        if (asal && asal.startsWith('detail_')) {
            const id = asal.replace('detail_', '');
            const targetCard = ev.newDocument.querySelector(`[data-id-kain="${id}"]`);
            if (targetCard) {
                // Tampilkan card agar View Transitions bisa melakukan morphing
                targetCard.style.display = 'flex';
                targetCard.classList.remove('hidden');
                
                // Pindahkan langsung ke urutan pertama di DOM baru (sebelum browser mengambil snapshot)
                // Ini memastikan arah terbangnya (morph) pas ke posisi awal grid!
                const gridArea = ev.newDocument.getElementById('area-galeri-testing');
                if (gridArea) {
                    gridArea.insertBefore(targetCard, gridArea.firstChild);
                }
            }
        }
    }
});
