import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const koleksiCollection = defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/koleksi" }),
    schema: z.object({
        'dc:identifier': z.string().optional(),
        'url_gambar_web': z.string().optional(),
        'dc:title': z.string().optional(),
        'dc:subject': z.record(z.string()).optional(),
        'dc:description': z.record(z.string()).optional(),
        'dc:coverage': z.string().optional(),
        'dc:format': z.string().optional(),
        'dc:source': z.string().optional(),
        'dc:rights': z.string().optional(),
        'dc:type': z.string().optional(),
        'dc:language': z.string().optional(),
    })
});

export const collections = {
    'koleksi': koleksiCollection,
};
