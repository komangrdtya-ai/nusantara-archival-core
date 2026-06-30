export const prerender = false;

import fs from 'node:fs/promises';
import path from 'node:path';

export const POST = async ({ request }) => {
    try {
        const data = await request.json();
        const { jsonContent, base64Image, fileName } = data;

        // Mendapatkan cakupan wilayah dari AI, default ke "Lainnya, Indonesia" jika kosong
        const coverage = jsonContent['dc:coverage'] || 'Lainnya, Indonesia';

        // Memformat nama folder berdasarkan coverage
        // Contoh: "Jawa Tengah, Indonesia"
        const parts = coverage.split(',');
        const region = parts[0].trim().toLowerCase().replace(/\s+/g, '-'); // "jawa-tengah"

        // Nama folder untuk gambar: misal "jawa-tengah"
        const folderNameForAssets = region;

        // Nama folder untuk JSON di koleksi: misal "jawa-tengah-indonesia"
        // Menghilangkan koma dan mengganti spasi menjadi strip untuk seluruh string coverage
        const folderNameForContent = coverage.trim().toLowerCase().replace(/\s*,\s*/g, '-').replace(/\s+/g, '-');

        // Pastikan URL gambar di JSON dan identifier sesuai
        const fileIdentifier = jsonContent["dc:identifier"] || fileName;
        jsonContent["url_gambar_web"] = `/assets/motif/${folderNameForAssets}/${fileIdentifier}.jpeg`;

        // Menentukan lokasi root folder proyek
        const rootDir = process.cwd();

        // Menentukan jalur tujuan folder assets dan content
        const assetsDir = path.join(rootDir, 'public', 'assets', 'motif', folderNameForAssets);
        const contentDir = path.join(rootDir, 'src', 'content', 'koleksi', folderNameForContent);

        // Otomatis membuat folder jika belum ada
        await fs.mkdir(assetsDir, { recursive: true });
        await fs.mkdir(contentDir, { recursive: true });

        // 1. Simpan file JSON ke src/content/koleksi/[daerah]/
        const jsonPath = path.join(contentDir, `${fileIdentifier}.json`);
        await fs.writeFile(jsonPath, JSON.stringify(jsonContent, null, 4));

        // 2. Simpan file Gambar ke public/assets/motif/[daerah]/
        const imagePath = path.join(assetsDir, `${fileIdentifier}.jpeg`);
        const imageBuffer = Buffer.from(base64Image, 'base64');
        await fs.writeFile(imagePath, imageBuffer);

        return new Response(JSON.stringify({
            success: true,
            message: `Tersimpan di ${folderNameForContent} dan ${folderNameForAssets}`
        }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};