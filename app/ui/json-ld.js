import { safeJsonLdString } from '@/lib/json-ld'

export default function JsonLd ({ data }) {
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: safeJsonLdString(data) }}
    />
  )
}
