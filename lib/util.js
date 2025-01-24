export const NUM_RESULTS_PER_PAGE = 21
export const NUM_PARTS_TO_TAG = 5

export const sortParts = (parts) => {
  return parts.sort((a, b) => {
    const numA = parseInt(a.reference_designator.match(/\d+$/)?.[0] || '0', 10)
    const numB = parseInt(b.reference_designator.match(/\d+$/)?.[0] || '0', 10)
    return numA - numB
  })
}
