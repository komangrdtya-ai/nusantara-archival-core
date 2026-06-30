// src/scripts/dataHandler.js
import batikData from '../data/metada_batik.json';

// Mengambil semua motif dari semua provinsi
export const getAllMotif = () => {
  return Object.values(batikData).flat();
};

// Mengambil nilai metadata dengan pencarian kunci yang fleksibel
export const getVal = (item, keyword) => {
  const key = Object.keys(item || {}).find(k => k.toLowerCase().includes(keyword.toLowerCase()));
  return key && item[key] ? String(item[key]).trim() : '';
};

// Mengolah warna dan hex dari "Warna Dominan"
export const getParsedColors = (item) => {
  const warnaRaw = getVal(item, 'warna');
  if (!warnaRaw) return [];

  return warnaRaw.split(',').map(part => {
    const match = part.trim().match(/(.*?)\s*\(\s*(#[0-9a-fA-F]{6})\s*\)/);
    return match ? { nama: match[1].trim(), hex: match[2] } : { nama: part.trim(), hex: '#ffffff' };
  });
};

// Mengambil data unik untuk filter
export const getUniqueWithCount = (keyword) => {
  const counts = {};
  getAllMotif().forEach(item => {
    const val = getVal(item, keyword);
    if (val) counts[val] = (counts[val] || 0) + 1;
  });
  return Object.entries(counts).map(([nama, jumlah]) => ({ nama, jumlah }));
};