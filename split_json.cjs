const fs = require('fs');
const path = require('path');

const inputFilePath = path.join(__dirname, 'src/data/dublin_core.json');
const outputBaseDir = path.join(__dirname, 'src/content/koleksi');

// Pastikan folder content/koleksi ada
if (!fs.existsSync(outputBaseDir)) {
    fs.mkdirSync(outputBaseDir, { recursive: true });
}

try {
    const rawData = fs.readFileSync(inputFilePath, 'utf-8');
    const data = JSON.parse(rawData);

    let count = 0;

    data.forEach(item => {
        if (!item['dc:identifier']) return;

        // Ambil nama file dan nama folder
        const identifier = item['dc:identifier'];
        let coverage = item['dc:coverage'] || 'unknown';

        // Bersihkan nama folder (hapus koma, spasi jadi underscore, lowercase)
        // Contoh: "DI Yogyakarta, Indonesia" -> "di_yogyakarta_indonesia"
        let folderName = coverage.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

        const folderPath = path.join(outputBaseDir, folderName);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const filePath = path.join(folderPath, `${identifier}.json`);
        fs.writeFileSync(filePath, JSON.stringify(item, null, 4));
        count++;
    });

    console.log(`Success! Splitted ${count} files into ${outputBaseDir}`);

} catch (error) {
    console.error('Error reading or parsing dublin_core.json:', error);
}
