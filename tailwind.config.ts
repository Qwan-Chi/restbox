import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#0F1117',
          panel: '#1A1D27',
          border: '#2A2D3A',
          hover: '#232634',
          input: '#15171F',
        },
        text: {
          primary: '#E8EAF0',
          secondary: '#6B7280',
        },
        accent: '#E07B39',
        success: '#22C55E',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
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
      minWidth: {
        app: '1280px',
      },
    },
  },
  plugins: [],
}

export default config
