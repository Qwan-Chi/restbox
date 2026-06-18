import { useAuthStore } from '@/store/useAuthStore'

export function LoginScreen() {
  const login = useAuthStore((s) => s.login)

  const handleSkip = () => {
    login({
      id: 'guest',
      provider: 'google',
      name: 'Гость',
      email: null,
      avatar: null,
      token: '',
      expiresAt: null,
      loginAt: Date.now(),
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-info/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-app-panel border border-app-border rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/40 flex items-center justify-center mb-4">
              <span className="text-4xl">🔩</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Restbox</h1>
            <p className="text-sm text-text-secondary mt-1">REST-клиент с AI-ассистентом Rusty</p>
          </div>
          <button
            onClick={handleSkip}
            className="w-full py-3 px-4 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors"
          >
            Продолжить
          </button>
        </div>
      </div>
    </div>
  )
}
