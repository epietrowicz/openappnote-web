import { SITE_URL } from './site-url'

export const HOME_CRUMB = { label: 'Home', href: '/' }

export function breadcrumbListSchema (items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`
    }))
  }
}
