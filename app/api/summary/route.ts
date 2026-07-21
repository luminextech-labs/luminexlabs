import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  // Fetch all commissions
  const res = await fetch(`${supabaseUrl}/rest/v1/commissions?select=platform,amount,status`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: res.status })
  }

  const commissions: { platform: string; amount: number; status: string }[] = await res.json()

  // Calculate summary per platform
  const summary: Record<string, { total: number; confirmed: number; pending: number }> = {}
  for (const c of commissions) {
    if (!summary[c.platform]) {
      summary[c.platform] = { total: 0, confirmed: 0, pending: 0 }
    }
    const amount = parseFloat(String(c.amount))
    summary[c.platform].total += amount
    if (c.status === 'confirmed') {
      summary[c.platform].confirmed += amount
    } else if (c.status === 'pending') {
      summary[c.platform].pending += amount
    }
  }

  return NextResponse.json(summary)
}
