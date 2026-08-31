export const NUM_RESULTS_PER_PAGE = 21
export const NUM_PARTS_TO_TAG = 5

export const REFS_TO_INCLUDE = ['U', 'IC', 'MOD', 'Q']

export const isRefToInclude = (ref) => {
  const normalized = ref?.trim()?.toUpperCase()
  if (!normalized) return false
  return REFS_TO_INCLUDE.some(prefix => normalized.startsWith(prefix))
}

export const sortParts = (parts) => {
  return parts.sort((a, b) => {
    const numA = parseInt(a.Reference.match(/\d+$/)?.[0] || '0', 10)
    const numB = parseInt(b.Reference.match(/\d+$/)?.[0] || '0', 10)
    return numA - numB
  })
}

export function getKicadProjectName (projectFiles) {
  const proPath = projectFiles.find(file => file.path.endsWith('.kicad_pro'))?.path
  return proPath?.split('/').pop().replace(/\.kicad_pro$/i, '') ?? null
}
