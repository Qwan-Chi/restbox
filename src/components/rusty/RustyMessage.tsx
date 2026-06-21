import { memo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import type { RustyMessage as RustyMessageType } from '@/types'
import { useT } from '@/utils/i18n'
import { RustyAvatar } from './RustyAvatar'

interface Props {
  message: RustyMessageType
}

function CodeBlock({ children }: { children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const onCopy = () => {
    const extract = (node: React.ReactNode): string => {
      if (typeof node === 'string') return node
      if (typeof node === 'number') return String(node)
      if (Array.isArray(node)) return node.map(extract).join('')
      if (node && typeof node === 'object' && 'props' in node) {
        return extract((node as React.ReactElement).props.children)
      }
      return ''
    }
    const text = extract(children)
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    })
  }
  return (
    <div className="relative group/code">
      <button
        onClick={onCopy}
        className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity text-[10px] px-1.5 py-0.5 rounded bg-app-hover text-text-secondary hover:text-text-primary"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
      <pre className="overflow-x-auto">{children}</pre>
    </div>
  )
}

export const RustyMessage = memo(function RustyMessage({ message }: Props) {
  const t = useT()
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[90%] bg-accent/15 border border-accent/30 rounded-lg px-3 py-2 text-sm text-text-primary">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <div className="shrink-0 pt-0.5">
        <RustyAvatar status="online" size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="rusty-markdown">
          {message.content ? (
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight]}
              components={{
                pre: (props) => <CodeBlock {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <span className="inline-flex items-center gap-1 text-text-secondary text-xs">
              <span className="inline-flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              {t('rusty.thinkingDots')}
            </span>
          )}
          {message.isStreaming && message.content && (
            <span className="inline-block w-1.5 h-3 bg-accent ml-0.5 animate-pulse align-middle" />
          )}
        </div>
      </div>
    </div>
  )
})
