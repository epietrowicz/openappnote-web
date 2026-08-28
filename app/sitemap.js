import { CURATED_TAGS } from '@/lib/tags'
import { SITE_URL } from '@/lib/site-url'

export default async function sitemap () {
  const staticRoutes = ['', '/online-pcb-viewer', '/tags'].map(path => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.5
  }))

  const tagRoutes = CURATED_TAGS.map(tag => ({
    url: `${SITE_URL}/tags/1/${tag}`,
    changeFrequency: 'weekly',
    priority: 0.7
  }))

  return [...staticRoutes, ...tagRoutes]
}
