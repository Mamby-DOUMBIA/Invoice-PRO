import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

const schema = z.object({ email: z.string().email('Email invalide') })
type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) { toast.error(error.message); return }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Email envoyé !</h2>
          <p className="text-sm text-slate-500">
            Consultez votre boîte mail : <strong>{getValues('email')}</strong>
          </p>
          <Link to="/auth/login" className="text-blue-600 text-sm hover:underline">
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Mot de passe oublié</h1>
          <p className="text-sm text-slate-500 mt-1 text-center">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Envoyer le lien
            </Button>
          </form>
        </div>
        <p className="text-center text-sm text-slate-500 mt-4">
          <Link to="/auth/login" className="text-blue-600 hover:underline">← Retour</Link>
        </p>
      </div>
    </div>
  )
}
