import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { OnayBekleyenHarcamalar } from './OnayBekleyenHarcamalar'
import { OdemeEkle } from './OdemeEkle'
import { TumHarcamalar } from './TumHarcamalar'
import { TumOdemeler } from './TumOdemeler'
import { PersonelSil } from './PersonelSil'
import { Receipt, CheckCircle, Clock, Wallet, TrendingUp, XCircle } from 'lucide-react'

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

      {/* Özet Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] p-4">
          <p className="text-[#555] text-xs font-medium flex items-center gap-1"><Receipt className="w-4 h-4" /> Toplam Harcama</p>
          <p className="text-[#333] text-lg font-bold mt-1">{toplamHarcama.toLocaleString('tr-TR')} ₺</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-[#00a65a]/30 p-4">
          <p className="text-[#00a65a] text-xs font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Onaylanan</p>
          <p className="text-[#00a65a] text-lg font-bold mt-1">{onaylananHarcama.toLocaleString('tr-TR')} ₺</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-[#f39c12]/30 p-4">
          <p className="text-[#f39c12] text-xs font-medium flex items-center gap-1"><Clock className="w-4 h-4" /> Bekleyen</p>
          <p className="text-[#f39c12] text-lg font-bold mt-1">{bekleyenHarcama.toLocaleString('tr-TR')} ₺</p>
          {bekleyenAdet > 0 && <p className="text-[#f39c12] text-xs mt-0.5">{bekleyenAdet} adet</p>}
        </div>
        <div className="bg-white rounded-xl shadow-md border border-[#dd4b39]/30 p-4">
          <p className="text-[#dd4b39] text-xs font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> Reddedilen</p>
          <p className="text-[#dd4b39] text-lg font-bold mt-1">{reddedilenHarcama.toLocaleString('tr-TR')} ₺</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-[#00c0ef]/30 p-4">
          <p className="text-[#00c0ef] text-xs font-medium flex items-center gap-1"><Wallet className="w-4 h-4" /> Alınan Ödeme</p>
          <p className="text-[#00c0ef] text-lg font-bold mt-1">{toplamOdeme.toLocaleString('tr-TR')} ₺</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-[#605ca8]/30 p-4">
          <p className="text-[#605ca8] text-xs font-medium flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Kalan Alacak</p>
          <p className={`text-lg font-bold mt-1 ${kalanAlacak >= 0 ? 'text-[#605ca8]' : 'text-[#dd4b39]'}`}>{kalanAlacak.toLocaleString('tr-TR')} ₺</p>
        </div>
      </div>

      <OnayBekleyenHarcamalar personelId={id} />

      <TumHarcamalar personelId={id} />

      <div className="mt-8">
        <TumOdemeler personelId={id} />
      </div>
    </div>
  )
}
