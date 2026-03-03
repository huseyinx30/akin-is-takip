import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FaturaDetayClient } from './FaturaDetayClient'

export default async function FaturaDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, companies(id, name)')
    .eq('id', id)
    .single()

  if (!invoice) notFound()

  const { data: companies } = await supabase.from('companies').select('id, name').order('name')

  return (
    <div>
      <Link href="/dashboard/faturalar" className="text-[#3c8dbc] hover:underline mb-4 inline-block font-medium">← Faturalara dön</Link>
      <FaturaDetayClient
        invoice={invoice}
        companies={companies || []}
      />
    </div>
  )
}
