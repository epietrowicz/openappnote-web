import DesignResults from '@/app/ui/design-results'
import { searchDesigns } from '@/lib/design-search'
import Pagination from '@/app/ui/pagination'
import Breadcrumbs from '@/app/ui/breadcrumbs'
import JsonLd from '@/app/ui/json-ld'
import { NUM_RESULTS_PER_PAGE } from '@/lib/util'
import { normalizeTag, isCuratedTag } from '@/lib/tags'
import { HOME_CRUMB, breadcrumbListSchema } from '@/lib/breadcrumb-schema'
import { notFound, permanentRedirect } from 'next/navigation'

export const revalidate = 86400

export async function generateMetadata ({ params }) {
  const { tag, page } = await params
  const pageNumber = parseInt(page ?? '1')
  const searchTitle = tag.replace(/-/g, ' ')

  let totalHits = 0
  try {
    ({ totalHits } = await searchDesigns(tag, pageNumber))
  } catch {
    totalHits = 0
  }

  const pageSuffix = pageNumber > 1 ? ` – Page ${pageNumber}` : ''
  const title = `Reference electronics designs for ${searchTitle}${pageSuffix}`
  const description = `Browse ${totalHits} open source reference designs tagged "${searchTitle}", including schematics, PCB layouts, and bills of materials sourced from public GitHub repositories.${pageSuffix}`

  return {
    title,
    description,
    alternates: { canonical: `/tags/1/${normalizeTag(tag)}` },
    openGraph: { title, description },
    twitter: { title, description },
    robots: pageNumber > 1 || !isCuratedTag(tag)
      ? { index: false, follow: true }
      : undefined
  }
}

async function fetchSearchResults (query, page) {
  try {
    return await searchDesigns(query, page)
  } catch (error) {
    console.error('Error fetching search results:', error)
    return notFound()
  }
}

export default async function ({ params }) {
  const tag = (await params).tag
  const page = (await params).page ?? '1'
  const pageNumber = parseInt(page)
  const normalizedTag = normalizeTag(tag)

  if (tag !== normalizedTag) {
    permanentRedirect(`/tags/${page}/${normalizedTag}`)
  }

  const searchTitle = normalizedTag.replace(/-/g, ' ')
  const curated = isCuratedTag(normalizedTag)

  const { results, totalHits } = await fetchSearchResults(normalizedTag, pageNumber)
  const nextPageNumber = results?.length < NUM_RESULTS_PER_PAGE ? pageNumber : pageNumber + 1
  const prevPageNumber = pageNumber === 1 ? 1 : pageNumber - 1

  const subTitle = totalHits > 1
    ? `${totalHits} results for "${searchTitle}"`
    : `${totalHits} result for "${searchTitle}"`

  const breadcrumbItems = [HOME_CRUMB, { label: searchTitle, href: `/tags/1/${normalizedTag}` }]

  return (
    <>
      <JsonLd data={breadcrumbListSchema(breadcrumbItems)} />
      <Breadcrumbs items={breadcrumbItems} />

      <div className='mx-auto text-center mt-6 max-w-lg'>
        <h1 className='text-4xl font-bold mt-2'>{searchTitle}</h1>
        <h2>{subTitle}</h2>
        {curated && (
          <p className='text-sm text-base-content/70 mt-2'>
            Browse {totalHits} open source reference designs tagged &quot;{searchTitle}&quot;,
            including schematics, PCB layouts, and bills of materials sourced from public GitHub repositories.
          </p>
        )}
      </div>
      <div className='flex-1'>
        <DesignResults designs={results} />
      </div>
      <Pagination
        pageNumber={pageNumber}
        nextPageNumber={nextPageNumber}
        prevPageNumber={prevPageNumber}
        searchQuery={normalizedTag}
      />
    </>
  )
}
