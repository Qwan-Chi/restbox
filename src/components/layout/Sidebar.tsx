import { useState } from 'react'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useCollectionStore } from '@/store/useCollectionStore'
import { useRequestStore } from '@/store/useRequestStore'
import { useRustyStore } from '@/store/useRustyStore'
import { useLayoutStore } from '@/store/useLayoutStore'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { useT } from '@/utils/i18n'
import { cn } from '@/utils/cn'
import { formatBytes, formatDuration } from '@/utils/formatJson'
import type { HttpMethod } from '@/types'

const METHOD_COLOR: Record<HttpMethod, string> = {
  GET: 'text-method-get',
  POST: 'text-method-post',
  PUT: 'text-method-put',
  PATCH: 'text-method-patch',
  DELETE: 'text-method-delete',
  HEAD: 'text-method-head',
  OPTIONS: 'text-method-options',
}

export function Sidebar() {
  const t = useT()
  const toggleSidebar = useLayoutStore((s) => s.toggleSidebar)
  const [tab, setTab] = useState<'history' | 'collections'>('history')
  const history = useHistoryStore((s) => s.items)
  const clearHistory = useHistoryStore((s) => s.clear)
  const removeHistory = useHistoryStore((s) => s.remove)
  const collections = useCollectionStore((s) => s.collections)
  const createCollection = useCollectionStore((s) => s.createCollection)
  const deleteCollection = useCollectionStore((s) => s.deleteCollection)
  const removeRequest = useCollectionStore((s) => s.removeRequest)
  const loadRequest = useRequestStore((s) => s.loadRequest)
  const setResponse = useRequestStore((s) => s.setResponse)
  const setAnomalies = useRustyStore((s) => s.setAnomalies)

  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  const onLoadHistory = (item: (typeof history)[number]) => {
    loadRequest(item.request)
    setResponse(item.response)
    setAnomalies([])
  }

  return (
    <aside className="h-full flex flex-col bg-app-panel border-r border-app-border">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-app-border">
        <div className="flex flex-1 rounded border border-app-border overflow-hidden">
          {(['history', 'collections'] as const).map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={cn(
                'flex-1 py-1.5 text-xs font-medium transition-colors',
                tab === tb
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-app-hover',
              )}
            >
              {tb === 'history'
                ? `${t('sidebar.history')} (${history.length})`
                : `${t('sidebar.collections')} (${collections.length})`}
            </button>
          ))}
        </div>
        <LanguageSwitcher />
        <ThemeToggle />
        <button
          onClick={toggleSidebar}
          className="btn-icon h-7 w-7 border border-app-border"
          title="Свернуть"
        >
          ◀
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {tab === 'history' ? (
          <div className="flex flex-col">
            {history.length === 0 ? (
              <EmptyState text={t('sidebar.historyEmpty')} />
            ) : (
              history.map((item) => {
                const url = item.request.url
                const short = url.length > 38 ? url.slice(0, 36) + '…' : url || '(no url)'
                return (
                  <div
                    key={item.id}
                    className="group flex items-center gap-2 px-3 py-2 border-b border-app-border/40 hover:bg-app-hover cursor-pointer"
                    onClick={() => onLoadHistory(item)}
                  >
                    <span className={cn('text-[10px] font-bold uppercase w-12 shrink-0', METHOD_COLOR[item.request.method])}>
                      {item.request.method}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-text-primary truncate font-mono">{short}</div>
                      <div className="text-[10px] text-text-secondary flex gap-2">
                        <span
                          className={cn(
                            item.response.status >= 200 && item.response.status < 300
                              ? 'text-success'
                              : item.response.status >= 400
                                ? 'text-error'
                                : 'text-text-secondary',
                          )}
                        >
                          {item.response.status}
                        </span>
                        <span>{formatDuration(item.response.duration)}</span>
                        <span>{formatBytes(item.response.size)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeHistory(item.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 btn-icon h-5 w-5 text-[10px]"
                      title={t('kv.delete')}
                    >
                      ✕
                    </button>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            {collections.length === 0 && !adding && (
              <EmptyState text={t('sidebar.collectionsEmpty')} />
            )}
            {collections.map((c) => (
              <div key={c.id} className="group border-b border-app-border/40">
                <div className="flex items-center gap-2 px-3 py-2 hover:bg-app-hover">
                  <span className="text-xs">📁</span>
                  <span className="flex-1 text-xs font-medium text-text-primary truncate">{c.name}</span>
                  <span className="text-[10px] text-text-secondary">{c.requests.length}</span>
                  <button
                    onClick={() => deleteCollection(c.id)}
                    className="opacity-0 group-hover:opacity-100 btn-icon h-5 w-5 text-[10px]"
                    title={t('sidebar.deleteCollection')}
                  >
                    ✕
                  </button>
                </div>
                {c.requests.map((r) => (
                  <div
                    key={r.id}
                    className="group/req flex items-center gap-2 pl-6 pr-3 py-1.5 hover:bg-app-hover cursor-pointer"
                    onClick={() => loadRequest(r, c.id)}
                  >
                    <span className={cn('text-[10px] font-bold uppercase w-10 shrink-0', METHOD_COLOR[r.method])}>
                      {r.method}
                    </span>
                    <span className="flex-1 text-xs text-text-primary truncate font-mono">
                      {r.name || r.url || t('sidebar.untitled')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeRequest(c.id, r.id)
                      }}
                      className="opacity-0 group-hover/req:opacity-100 btn-icon h-5 w-5 text-[10px]"
                      title={t('sidebar.deleteRequest')}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ))}

            {adding ? (
              <div className="flex gap-2 p-3">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('sidebar.collectionName')}
                  className="input-base py-1.5 text-xs"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (newName.trim()) createCollection(newName.trim())
                      setNewName('')
                      setAdding(false)
                    } else if (e.key === 'Escape') {
                      setNewName('')
                      setAdding(false)
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newName.trim()) createCollection(newName.trim())
                    setNewName('')
                    setAdding(false)
                  }}
                  className="px-2 py-1 text-xs bg-accent text-white rounded"
                >
                  OK
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="px-3 py-2 text-xs text-accent hover:text-accent/80 text-left"
              >
                {t('sidebar.newCollection')}
              </button>
            )}
          </div>
        )}
      </div>

      {tab === 'history' && history.length > 0 && (
        <button
          onClick={clearHistory}
          className="border-t border-app-border px-3 py-2 text-xs text-text-secondary hover:text-error transition-colors text-left"
        >
          {t('sidebar.clearHistory')}
        </button>
      )}
    </aside>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-4 py-8 text-center text-xs text-text-secondary/70 leading-relaxed">{text}</div>
  )
}
