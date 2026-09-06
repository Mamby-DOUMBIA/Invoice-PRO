import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Eye, EyeOff, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

const schema = z.object({
  full_name: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password'],
})
type FormData = z.infer<typeof schema>

export function SignupPage() {
  const navigate = useNavigate()
  const { setUser, setSession } = useAuthStore()
  const [showPwd, setShowPwd] = useState(false)
  const [emailSent, setEmailSent] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        toast.error('Un compte existe déjà avec cet email.')
      } else {
        toast.error(error.message)
      }
      return
    }

    // Case 1: email confirmation disabled → session is immediately available
    if (authData.session) {
      const user = authData.session.user
      setSession(authData.session)
      setUser(user)

      toast.success('Compte créé ! Bienvenue sur InvoicePro.')
      navigate('/onboarding')

      // Profile creation must not delay the first authenticated screen.
      void supabase.from('user_profiles').upsert({
        id: user.id,
        full_name: data.full_name,
      }, { onConflict: 'id' }).then(({ error }) => {
        if (error) console.error('[auth] profile creation error:', error)
      })
      return
    }

    // Case 2: email confirmation required → show "check your email"
    setEmailSent(data.email)
  }

  // ── Email sent screen ──────────────────────────────────────────────────────
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Vérifiez votre email
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              Un lien de confirmation a été envoyé à :
            </p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-6 break-all">
              {emailSent}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-left mb-6">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">
                Étapes suivantes :
              </p>
              <ol className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">1.</span>
                  Ouvrez votre boîte mail
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">2.</span>
                  Cliquez sur le lien de confirmation
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">3.</span>
                  Vous serez redirigé vers l'onboarding
                </li>
              </ol>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Pas d'email ? Vérifiez vos spams ou{' '}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setEmailSent('')}
              >
                réessayez
              </button>
              .
            </p>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/auth/login')}
            >
              Retour à la connexion
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Signup form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">InvoicePro</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Créez votre compte gratuitement
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Nom complet"
              placeholder="Mamadou Koné"
              autoComplete="name"
              autoFocus
              error={errors.full_name?.message}
              required
              {...register('full_name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              autoComplete="email"
              error={errors.email?.message}
              required
              {...register('email')}
            />
            <Input
              label="Mot de passe"
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.password?.message}
              hint="Minimum 8 caractères"
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  tabIndex={-1}
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                >
                  {showPwd
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register('password')}
            />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.confirm_password?.message}
              required
              {...register('confirm_password')}
            />

            <Button type="submit" className="w-full mt-2" size="lg" loading={isSubmitting}>
              Créer mon compte
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
          Vous avez déjà un compte ?{' '}
          <Link to="/auth/login" className="text-blue-600 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
