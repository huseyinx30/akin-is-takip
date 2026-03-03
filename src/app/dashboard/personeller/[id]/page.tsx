import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { OdemeEkle } from './OdemeEkle'
import { PersonelSil } from './PersonelSil'
import { PersonelDetayClient } from './PersonelDetayClient'

export default async function PersonelDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).eq('role', 'personel').single()
  if (!profile) return <div className="p-8 text-[#555]">Personel bulunamadı.</div>

  const [
    { data: expenses },
    { data: payments },
  ] = await Promise.all([
    supabase.from('personnel_expenses').select('*').eq('personel_id', id).order('expense_date', { ascending: false }),
    supabase.from('personnel_payments').select('*').eq('personel_id', id).order('payment_date', { ascending: false }),
  ])

  const toplamHarcama = (expenses || []).reduce((s, e) => s + Number(e.amount), 0)
  const onaylananHarcama = (expenses || []).filter((e) => e.status === 'onaylandi').reduce((s, e) => s + Number(e.amount), 0)
  const bekleyenHarcama = (expenses || []).filter((e) => e.status === 'beklemede').reduce((s, e) => s + Number(e.amount), 0)
  const reddedilenHarcama = (expenses || []).filter((e) => e.status === 'reddedildi').reduce((s, e) => s + Number(e.amount), 0)
  const bekleyenAdet = (expenses || []).filter((e) => e.status === 'beklemede').length
  const toplamOdeme = (payments || []).reduce((s, p) => s + Number(p.amount), 0)
  const kalanAlacak = onaylananHarcama - toplamOdeme

  return (
    <div>
      <Link href="/dashboard/personeller" className="text-[#3c8dbc] hover:underline mb-4 inline-block font-medium">← Personellere dön</Link>

      <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] p-6 mb-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#333]">{profile.full_name}</h1>
            <p className="text-[#555] mt-1">{profile.phone || '-'}</p>
            {profile.whatsapp && (
              <WhatsAppLink phone={profile.whatsapp} className="mt-2" />
            )}
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <OdemeEkle personelId={id} />
            <PersonelSil personelId={id} personelAdi={profile.full_name} />
          </div>
        </div>
      </div>

      <PersonelDetayClient
        personelId={id}
        toplamHarcama={toplamHarcama}
        onaylananHarcama={onaylananHarcama}
        bekleyenHarcama={bekleyenHarcama}
        bekleyenAdet={bekleyenAdet}
        reddedilenHarcama={reddedilenHarcama}
        toplamOdeme={toplamOdeme}
        kalanAlacak={kalanAlacak}
      />
    </div>
  )
}
