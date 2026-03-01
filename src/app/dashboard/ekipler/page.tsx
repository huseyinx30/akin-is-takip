import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { Receipt, CheckCircle, Clock, Wallet, TrendingUp, User } from 'lucide-react'

export default async function EkiplerPage() {
  const supabase = await createClient()
  const [
    { data: ekipler },
    { data: allExpenses },
    { data: allPayments },
    { data: workLogs },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'ekip').order('full_name'),
    supabase.from('team_expenses').select('ekip_id, amount, status'),
    supabase.from('team_payments').select('ekip_id, amount'),
    supabase.from('work_logs').select('ekip_id'),
  ])

  const getStats = (ekipId: string) => {
    const expenses = (allExpenses || []).filter((e) => e.ekip_id === ekipId)
    const payments = (allPayments || []).filter((p) => p.ekip_id === ekipId)
    const logs = (workLogs || []).filter((w) => w.ekip_id === ekipId)
    const toplamHarcama = expenses.reduce((s, e) => s + Number(e.amount), 0)
    const onaylananHarcama = expenses.filter((e) => e.status === 'onaylandi').reduce((s, e) => s + Number(e.amount), 0)
    const bekleyenHarcama = expenses.filter((e) => e.status === 'beklemede').reduce((s, e) => s + Number(e.amount), 0)
    const bekleyenAdet = expenses.filter((e) => e.status === 'beklemede').length
    const toplamOdeme = payments.reduce((s, p) => s + Number(p.amount), 0)
    const kalanAlacak = onaylananHarcama - toplamOdeme
    return { toplamHarcama, onaylananHarcama, bekleyenHarcama, bekleyenAdet, toplamOdeme, kalanAlacak, isKayitSayisi: logs.length }
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#333]">Ekipler</h1>
          <p className="text-[#555] text-sm mt-0.5">Ekip listesi ve özet bilgiler</p>
        </div>
        <Link
          href="/dashboard/ekipler/yeni"
          className="px-4 py-2 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium"
        >
          + Yeni Ekip
        </Link>
      </div>

      {ekipler && ekipler.length > 0 ? (
        <div className="grid gap-6">
          {ekipler.map((e) => {
            const stats = getStats(e.id)
            return (
              <Link key={e.id} href={`/dashboard/ekipler/${e.id}`} className="block">
                <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] overflow-hidden hover:shadow-lg hover:border-[#3c8dbc]/30 transition-all">
                  <div className="p-5 border-b border-[#e3e6f0] flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#3c8dbc]/15 flex items-center justify-center">
                        <User className="w-6 h-6 text-[#3c8dbc]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#333]">{e.full_name}</h3>
                        <p className="text-[#555] text-sm">{e.phone || '-'}</p>
                        {e.whatsapp && <WhatsAppLink phone={e.whatsapp} className="mt-1" />}
                      </div>
                    </div>
                    <span className="text-[#3c8dbc] font-medium text-sm">Detay →</span>
                  </div>
                  <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="p-3 rounded-lg bg-[#f8f9fc]">
                      <p className="text-[#555] text-xs font-medium">Toplam Harcama</p>
                      <p className="text-[#333] font-bold mt-0.5">{stats.toplamHarcama.toLocaleString('tr-TR')} ₺</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#00a65a]/10">
                      <p className="text-[#00a65a] text-xs font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Onaylanan</p>
                      <p className="text-[#00a65a] font-bold mt-0.5">{stats.onaylananHarcama.toLocaleString('tr-TR')} ₺</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#f39c12]/10">
                      <p className="text-[#f39c12] text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Bekleyen</p>
                      <p className="text-[#f39c12] font-bold mt-0.5">{stats.bekleyenHarcama.toLocaleString('tr-TR')} ₺</p>
                      {stats.bekleyenAdet > 0 && <p className="text-[#f39c12] text-xs mt-0.5">{stats.bekleyenAdet} adet</p>}
                    </div>
                    <div className="p-3 rounded-lg bg-[#00c0ef]/10">
                      <p className="text-[#00c0ef] text-xs font-medium flex items-center gap-1"><Wallet className="w-3 h-3" /> Alınan Ödeme</p>
                      <p className="text-[#00c0ef] font-bold mt-0.5">{stats.toplamOdeme.toLocaleString('tr-TR')} ₺</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#605ca8]/10">
                      <p className="text-[#605ca8] text-xs font-medium flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Kalan Alacak</p>
                      <p className={`font-bold mt-0.5 ${stats.kalanAlacak >= 0 ? 'text-[#605ca8]' : 'text-[#dd4b39]'}`}>{stats.kalanAlacak.toLocaleString('tr-TR')} ₺</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#f8f9fc]">
                      <p className="text-[#555] text-xs font-medium flex items-center gap-1"><Receipt className="w-3 h-3" /> İş Kaydı</p>
                      <p className="text-[#333] font-bold mt-0.5">{stats.isKayitSayisi}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-12 text-center text-[#555]">
          Henüz ekip eklenmemiş. Ekipler kayıt sayfasından eklenebilir (admin rolü ile atanır).
        </div>
      )}
    </div>
  )
}
