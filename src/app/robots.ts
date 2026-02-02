import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/login/',
                    '/signup/',
                    '/account/',
                    '/api/',
                ],
            },
            {
                userAgent: ['GPTBot', 'ChatGPT-User', 'Google-Extended', 'OAI-SearchBot'],
                allow: '/',
            }
        ],
        sitemap: 'https://fleuris.store/sitemap.xml',
    }
}
