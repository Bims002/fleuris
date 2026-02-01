import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: ['*', 'GPTBot', 'ChatGPT-User', 'Google-Extended'],
                allow: '/',
                disallow: [
                    '/admin/',
                    '/login/',
                    '/signup/',
                    '/account/',
                    '/api/',
                ],
            }
        ],
        sitemap: 'https://fleuris.store/sitemap.xml',
    }
}
