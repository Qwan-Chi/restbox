import { useRef, type ChangeEvent } from 'react'
import { useRequestStore } from '@/store/useRequestStore'
import { formatBytes } from '@/utils/formatJson'

export function BinaryFileUpload() {
  const body = useRequestStore((s) => s.current.body)
  const setBody = useRequestStore((s) => s.setBody)
  const binaryFileObj = useRequestStore((s) => s.binaryFileObj)
  const setBinaryFile = useRequestStore((s) => s.setBinaryFile)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setBinaryFile(file)
    if (file) {
      setBody({
        ...body,
        binaryFile: { name: file.name, size: file.size },
      })
    } else {
      setBody({ ...body, binaryFile: null })
    }
  }

  const handleClear = () => {
    setBinaryFile(null)
    setBody({ ...body, binaryFile: null })
    if (inputRef.current) inputRef.current.value = ''
  }

  const hasFile = binaryFileObj !== null

  return (
    <div className="flex flex-col gap-2">
      <div
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-app-border rounded-lg cursor-pointer hover:border-accent hover:bg-app-hover transition-colors"
      >
        <span className="text-3xl opacity-50">📁</span>
        <span className="text-xs text-text-secondary">
          {hasFile
            ? 'Файл выбран — нажми чтобы заменить'
            : 'Нажми чтобы выбрать файл'}
        </span>
        <input
          ref={inputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {hasFile && (
        <div className="flex items-center gap-2 px-3 py-2 bg-app-input border border-app-border rounded-lg">
          <span className="text-xs text-text-primary truncate flex-1">
            {binaryFileObj!.name}
          </span>
          <span className="text-[11px] text-text-secondary shrink-0">
            {formatBytes(binaryFileObj!.size)}
          </span>
          <button
            onClick={handleClear}
            className="text-xs text-error hover:text-error/80 shrink-0"
            title="Убрать файл"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
