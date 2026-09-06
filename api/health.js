export default function handler(_request, response) {
  response.status(200).json({
    ok: true,
    service: 'invoicepro',
    supabaseConfigured: Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY)),
  })
}
