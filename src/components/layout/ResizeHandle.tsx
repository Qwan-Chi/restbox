import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'

interface Props {
  direction: 'horizontal' | 'vertical'
  onResize: (deltaPx: number) => void
  title?: string
}

export function ResizeHandle({ direction, onResize, title }: Props) {
  const [dragging, setDragging] = useState(false)
  const startPos = useRef(0)

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (direction === 'horizontal') {
        onResize(e.clientX - startPos.current)
      } else {
        onResize(e.clientY - startPos.current)
      }
      startPos.current = direction === 'horizontal' ? e.clientX : e.clientY
    },
    [direction, onResize],
  )

  const onMouseUp = useCallback(() => {
    setDragging(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    startPos.current = direction === 'horizontal' ? e.clientX : e.clientY
    setDragging(true)
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    if (!dragging) return
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging, onMouseMove, onMouseUp])

  const isHorizontal = direction === 'horizontal'

  return (
    <div
      onMouseDown={onMouseDown}
      className={cn(
        'shrink-0 relative group transition-colors z-50 flex items-center justify-center',
        isHorizontal
          ? 'w-3 cursor-col-resize h-full'
          : 'h-3 cursor-row-resize w-full',
        dragging ? 'bg-accent/10' : 'hover:bg-accent/5',
      )}
      title={title}
    >
      <div
        className={cn(
          'rounded-full transition-colors',
          isHorizontal ? 'w-1.5 h-full' : 'h-1.5 w-full',
          dragging ? 'bg-accent' : 'bg-app-border group-hover:bg-accent/60',
        )}
      />
    </div>
  )
}
