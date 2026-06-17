import { useRequestStore } from '@/store/useRequestStore'
import { KeyValueEditor } from './KeyValueEditor'

export function ParamsEditor() {
  const params = useRequestStore((s) => s.current.params)
  const setParams = useRequestStore((s) => s.setParams)
  return <KeyValueEditor items={params} onChange={setParams} keyPlaceholder="page" valuePlaceholder="1" />
}
