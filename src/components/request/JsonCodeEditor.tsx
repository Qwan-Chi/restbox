import { useEffect, useRef } from 'react'
import { EditorState, type Extension } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { linter, lintGutter } from '@codemirror/lint'
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, indentOnInput } from '@codemirror/language'
import { formatJson } from '@/utils/formatJson'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function JsonCodeEditor({ value, onChange, placeholder }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current) return

    const formatKeymap = keymap.of([
      {
        key: 'Shift-Ctrl-f',
        preventDefault: true,
        run: (view) => {
          const text = view.state.doc.toString()
          const parsed = tryFormat(text)
          if (parsed !== null) {
            view.dispatch({
              changes: { from: 0, to: view.state.doc.length, insert: parsed },
            })
          }
          return true
        },
      },
    ])

    const extensions: Extension[] = [
      lineNumbers(),
      foldGutter(),
      history(),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      lintGutter(),
      linter(jsonParseLinter()),
      json(),
      formatKeymap,
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        ...completionKeymap,
        indentWithTab,
      ]),
      EditorView.lineWrapping,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current(update.state.doc.toString())
        }
      }),
      EditorView.contentAttributes.of({ 'aria-label': placeholder ?? 'JSON editor' }),
    ]

    const view = new EditorView({
      state: EditorState.create({ doc: value, extensions }),
      parent: containerRef.current,
    })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      })
    }
  }, [value])

  return <div ref={containerRef} className="h-full min-h-[200px] overflow-hidden" />
}

function tryFormat(text: string): string | null {
  try {
    return formatJson(JSON.parse(text))
  } catch {
    return null
  }
}
