import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { FileText, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const [showPwd, setShowPwd] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) {
      toast.error('Email ou mot de passe incorrect.')
      return
    }
    // onAuthStateChange will load org and the route guards will redirect properly
    // No explicit navigate needed — PublicRoute handles it reactively
  }

  async function loginWithGoogle() {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/settings`, {
        headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
      })
      const settings = await response.json() as { external?: { google?: boolean } }
      if (!response.ok || !settings.external?.google) {
        toast.error('La connexion Google n’est pas activée sur ce projet.')
        return
      }
    } catch {
      toast.error('Impossible de vérifier la connexion Google.')
      return
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) {
      if (error.message.toLowerCase().includes('provider is not enabled')) {
        toast.error('La connexion Google n’est pas activée sur ce projet.')
      } else {
        toast.error('Impossible de démarrer la connexion Google.')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent dark:bg-slate-950 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-[0_12px_24px_rgba(61,90,254,.24)]">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">InvoicePro</h1>
          <p className="text-sm text-slate-500 mt-1">Connectez-vous à votre compte</p>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-3xl border border-slate-200/80 dark:border-slate-800 p-7 shadow-[0_18px_45px_rgba(30,45,80,.1)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Mot de passe"
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              rightIcon={
                <button type="button" onClick={() => setShowPwd(v => !v)} className="text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register('password')}
            />
            <div className="flex justify-end">
              <Link to="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Se connecter
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">ou</span>
            </div>
          </div>

          <button
            onClick={loginWithGoogle}
            type="button"
            className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Pas encore de compte ?{' '}
          <Link to="/auth/signup" className="text-blue-600 font-medium hover:underline">Créer un compte</Link>
        </p>
      </div>
    </div>
  )
}
