import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'var(--app-bg)',
          panel: 'var(--app-panel)',
          border: 'var(--app-border)',
          hover: 'var(--app-hover)',
          input: 'var(--app-input)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        accent: 'var(--accent)',
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        info: 'var(--info)',
        method: {
          get: '#3B82F6',
          post: '#22C55E',
          put: '#F59E0B',
          patch: '#E07B39',
          delete: '#EF4444',
          head: '#6B7280',
          options: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      width: {
        sidebar: '240px',
        rusty: '360px',
      },
    },
  },
  plugins: [],
}

export default config
