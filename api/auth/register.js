import { createClient } from '@supabase/supabase-js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) {
    response.status(503).json({ error: 'Supabase is not configured' })
    return
  }

  const { email, password, full_name } = request.body || {}
  if (typeof email !== 'string' || typeof password !== 'string' || password.length < 8) {
    response.status(400).json({ error: 'A valid email and a password of at least 8 characters are required' })
    return
  }

  const supabase = createClient(url, key)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: typeof full_name === 'string' ? full_name : '' },
      emailRedirectTo: `${process.env.APP_URL || ''}/onboarding`,
    },
  })

  if (error) {
    response.status(400).json({ error: error.message })
    return
  }

  response.status(201).json({
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
    sessionCreated: Boolean(data.session),
  })
}
