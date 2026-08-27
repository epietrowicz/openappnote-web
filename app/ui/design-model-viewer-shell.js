import { fetchModel } from '@/lib/fetch-model'
import DesignModelViewer from './design-model-viewer'

export default async function DesignModelViewerShell ({ pcbUrl, className }) {
  const modelBase64 = await fetchModel(pcbUrl)
  return <DesignModelViewer modelBase64={modelBase64} className={className} />
}
