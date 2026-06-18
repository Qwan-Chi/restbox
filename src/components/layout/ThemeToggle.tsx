import { useThemeStore } from '@/store/useThemeStore'
import { cn } from '@/utils/cn'

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggle)

  return (
    <button
      onClick={toggle}
      className={cn(
        'btn-icon h-7 w-7 border border-app-border text-sm',
      )}
      title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
