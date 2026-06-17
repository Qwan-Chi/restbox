import { useState } from 'react'
import { useRequestStore } from '@/store/useRequestStore'
import { useCollectionStore } from '@/store/useCollectionStore'
import { useT } from '@/utils/i18n'
import { cn } from '@/utils/cn'
import { v4 as uuid } from 'uuid'

export function UrlInput() {
  const t = useT()
  const url = useRequestStore((s) => s.current.url)
  const name = useRequestStore((s) => s.current.name)
  const setUrl = useRequestStore((s) => s.setUrl)
  const setName = useRequestStore((s) => s.setName)
  const current = useRequestStore((s) => s.current)
  const collections = useCollectionStore((s) => s.collections)
  const activeCollectionId = useCollectionStore((s) => s.activeCollectionId)
  const createCollection = useCollectionStore((s) => s.createCollection)
  const addRequest = useCollectionStore((s) => s.addRequest)

  const [saving, setSaving] = useState(false)
  const [saveName, setSaveName] = useState(name)
  const [saveCollectionId, setSaveCollectionId] = useState<string>(activeCollectionId ?? '')
  const [newCollectionName, setNewCollectionName] = useState('')

  const onSave = () => {
    setSaveName(name || url || 'Untitled')
    setSaving(true)
  }

  const confirmSave = () => {
    let colId = saveCollectionId
    if (newCollectionName.trim()) {
      colId = createCollection(newCollectionName.trim())
    }
    if (!colId) return
    const req = { ...JSON.parse(JSON.stringify(current)), id: uuid(), name: saveName.trim() || 'Untitled' }
    addRequest(colId, req)
    setName(req.name)
    setSaving(false)
    setNewCollectionName('')
  }

  return (
    <div className="flex-1 flex items-stretch">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.form?.requestSubmit()
        }}
        placeholder={t('url.placeholder')}
        className="flex-1 bg-app-input border border-app-border border-l-0 border-r-0 px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent"
      />
      <button
        onClick={onSave}
        className="btn-icon px-3 border border-app-border"
        title={t('url.saveTitle')}
      >
        🔖
      </button>

      {saving && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setSaving(false)}
        >
          <div
            className="w-96 bg-app-panel border border-app-border rounded-lg p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold mb-4">{t('url.saveRequest')}</h3>

            <label className="block text-xs text-text-secondary mb-1">{t('url.requestName')}</label>
            <input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="input-base mb-3"
              autoFocus
            />

            {!newCollectionName ? (
              <>
                <label className="block text-xs text-text-secondary mb-1">{t('url.collection')}</label>
                <select
                  value={saveCollectionId}
                  onChange={(e) => setSaveCollectionId(e.target.value)}
                  className="input-base mb-2"
                >
                  <option value="">{t('url.selectCollection')}</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setNewCollectionName(' ')}
                  className="text-xs text-accent hover:text-accent/80"
                >
                  {t('url.newCollection')}
                </button>
              </>
            ) : (
              <>
                <label className="block text-xs text-text-secondary mb-1">{t('url.newCollection')}</label>
                <div className="flex gap-2">
                  <input
                    value={newCollectionName.trim() === '' ? '' : newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder={t('url.newCollectionName')}
                    className="input-base mb-2"
                    autoFocus
                  />
                  <button
                    onClick={() => setNewCollectionName('')}
                    className="btn-icon px-3 border border-app-border"
                  >
                    ✕
                  </button>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setSaving(false)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded border border-app-border',
                  'hover:bg-app-hover transition-colors',
                )}
              >
                {t('url.cancel')}
              </button>
              <button
                onClick={confirmSave}
                disabled={!saveCollectionId && !newCollectionName.trim()}
                className="px-3 py-1.5 text-xs rounded bg-accent text-white hover:bg-accent/80 disabled:opacity-40 transition-colors"
              >
                {t('url.saveBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
