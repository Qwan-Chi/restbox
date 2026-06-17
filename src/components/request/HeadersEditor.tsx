import { useRequestStore } from '@/store/useRequestStore'
import { KeyValueEditor } from './KeyValueEditor'

export function HeadersEditor() {
  const headers = useRequestStore((s) => s.current.headers)
  const setHeaders = useRequestStore((s) => s.setHeaders)
  return <KeyValueEditor items={headers} onChange={setHeaders} keyPlaceholder="Content-Type" valuePlaceholder="application/json" />
}
