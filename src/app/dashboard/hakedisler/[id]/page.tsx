import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { HakedisDetayClient } from './HakedisDetayClient'

export default async function HakedisDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: payment } = await supabase
    .from('progress_payments')
    .select('*, invoices(id, invoice_no, invoice_date, total_amount, company_id, companies(name)), projects(id, name, companies(name))')
    .eq('id', id)
    .single()

  if (!payment) notFound()

  const { data: companies } = await supabase.from('companies').select('id, name').order('name')
  let invoices: { id: string; invoice_no: string; invoice_date: string; total_amount: number }[] = []
  const inv = payment.invoices as { company_id?: string } | null
  if (inv?.company_id) {
    const { data: invData } = await supabase.from('invoices').select('id, invoice_no, invoice_date, total_amount').eq('company_id', inv.company_id).order('invoice_date', { ascending: false })
    invoices = invData || []
  }

  return (
    <div>
      <Link href="/dashboard/hakedisler" className="text-[#3c8dbc] hover:underline mb-4 inline-block font-medium">← Hakedişlere dön</Link>
      <HakedisDetayClient
        payment={payment}
        companies={companies || []}
        invoices={invoices}
      />
    </div>
  )
}
