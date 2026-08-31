import { getRepository } from '@/lib/github-repository'
import {
  getInitialSizeRanges,
  splitRange,
  rangeId,
  rangeQuery,
  searchCodePage,
  CODE_RESULTS_PER_PAGE,
  SEARCH_RESULT_CAP
} from './discovery-code-search'
import { crawlRepository } from './run-crawl'
import { getCrawlState, setCrawlState } from './state'

const FRONTIER_STATE_ID = 'code-search-frontier'
const RESWEEP_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000

async function getFrontier (client) {
  const state = await getCrawlState(FRONTIER_STATE_ID, client)
  if (state?.ranges?.length > 0) return state.ranges

  // Frontier is empty (or this is the very first run) - only start a fresh
  // sweep once the last one has been done for a while. Repos we've already
  // seen recently get skipped instantly by crawlRepository's own recrawl
  // gate, so a resweep is cheap; only new files/repos do real work.
  const dueForResweep = !state?.completedAt ||
    Date.now() - new Date(state.completedAt).getTime() >= RESWEEP_INTERVAL_MS
  return dueForResweep ? getInitialSizeRanges() : []
}

async function setFrontier (ranges, client) {
  const doc = { id: FRONTIER_STATE_ID, kind: 'code-search-frontier', ranges }
  if (ranges.length === 0) doc.completedAt = new Date().toISOString()
  await setCrawlState(doc, client)
}

function parseOwnerRepo (item) {
  const [owner, repo] = item.repository.full_name.split('/')
  return { owner, repo }
}

async function resolveRepository (owner, repo) {
  try {
    return await getRepository(owner, repo)
  } catch (error) {
    console.error(`Failed to resolve repository ${owner}/${repo}:`, error.status ?? error)
    return null
  }
}

// Processes one page of one size range. Returns { splitInto: [range, range] }
// when the range turns out to exceed GitHub's 1000-result cap and needs to be
// halved, otherwise { done: boolean } - done once the range is fully paged through.
async function crawlOneRangePage (range, deadline, client) {
  const id = rangeId(range)
  const state = await getCrawlState(id, client)
  const query = rangeQuery(range)
  const page = (state?.lastPage ?? 0) + 1

  const { items, totalCount } = await searchCodePage(query, page)

  if (page === 1 && totalCount > SEARCH_RESULT_CAP) {
    const children = splitRange(range)
    if (children) return { splitInto: children }
    console.warn(`Range ${id} has ${totalCount} results and can't be split further - only the first ${SEARCH_RESULT_CAP} are reachable.`)
  }

  // A repo can surface multiple .kicad_sch hits in one page - dedupe before
  // resolving/crawling, findKicadProjectDirs already discovers every project
  // in the repo regardless of which specific file matched this query.
  const uniqueRepos = new Map()
  for (const item of items) {
    const { owner, repo } = parseOwnerRepo(item)
    uniqueRepos.set(`${owner}/${repo}`, { owner, repo })
  }

  for (const { owner, repo } of uniqueRepos.values()) {
    if (Date.now() > deadline) break
    const repository = await resolveRepository(owner, repo)
    if (repository) await crawlRepository(repository, deadline, client)
  }

  const exhausted = items.length === 0 || page * CODE_RESULTS_PER_PAGE >= Math.min(totalCount, SEARCH_RESULT_CAP)
  await setCrawlState({ id, kind: 'code-search-range', query, lastPage: page, totalHits: totalCount, exhausted }, client)

  return { done: exhausted }
}

export async function runChannelACrawl ({ budgetMs = 270_000, client } = {}) {
  const startedAt = Date.now()
  const deadline = startedAt + budgetMs

  let frontier = await getFrontier(client)
  let queriesProcessed = 0

  while (frontier.length > 0 && Date.now() < deadline) {
    const range = frontier[0]
    const result = await crawlOneRangePage(range, deadline, client)
    queriesProcessed += 1

    if (result.splitInto) {
      frontier = [...result.splitInto, ...frontier.slice(1)]
    } else if (result.done) {
      frontier = frontier.slice(1)
    }
    // else: range still has more pages - stays at the front of the frontier so
    // the next iteration (this run or a later one) resumes it via its own lastPage.

    await setFrontier(frontier, client)
  }

  return {
    queriesProcessed,
    remainingRanges: frontier.length,
    durationMs: Date.now() - startedAt
  }
}
