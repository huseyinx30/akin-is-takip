import { createClient } from '@/lib/supabase/server'

export default async function OnMuhasebePage() {
  const supabase = await createClient()

  const [invoicesRes, personnelExpRes, teamExpRes, companyExpRes, personnelPayRes, teamPayRes] = await Promise.all([
    supabase.from('invoices').select('total_amount, status'),
    supabase.from('personnel_expenses').select('amount, status').eq('status', 'onaylandi'),
    supabase.from('team_expenses').select('amount, status').eq('status', 'onaylandi'),
    supabase.from('company_expenses').select('amount'),
    supabase.from('personnel_payments').select('amount'),
    supabase.from('team_payments').select('amount'),
  ])

  const toplamFatura = (invoicesRes.data || []).reduce((s, i) => s + Number(i.total_amount), 0)
  const personelGiderleri = (personnelExpRes.data || []).reduce((s, e) => s + Number(e.amount), 0)
  const ekipGiderleri = (teamExpRes.data || []).reduce((s, e) => s + Number(e.amount), 0)
  const sirketGiderleri = (companyExpRes.data || []).reduce((s, e) => s + Number(e.amount), 0)
  const personelOdemeleri = (personnelPayRes.data || []).reduce((s, p) => s + Number(p.amount), 0)
  const ekipOdemeleri = (teamPayRes.data || []).reduce((s, p) => s + Number(p.amount), 0)

  const toplamGider = personelGiderleri + ekipGiderleri + sirketGiderleri + personelOdemeleri + ekipOdemeleri
  const kar = toplamFatura - toplamGider
  const karMarji = toplamFatura > 0 ? ((kar / toplamFatura) * 100).toFixed(1) : '0'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#333]">Ön Muhasebe</h1>
        <p className="text-[#555] text-sm mt-0.5">Gelir ve gider özeti</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6">
            <h3 className="text-lg font-medium text-[#333] mb-4">Gelirler</h3>
            <div className="text-3xl font-bold text-[#00a65a]">{toplamFatura.toLocaleString('tr-TR')} ₺</div>
            <p className="text-[#555] text-sm mt-1">Toplam Fatura (Kesilen)</p>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6">
            <h3 className="text-lg font-medium text-[#333] mb-4">Giderler</h3>
            <div className="space-y-2 text-[#555]">
              <div className="flex justify-between">
                <span>Personel Harcamaları (Onaylı)</span>
                <span>{personelGiderleri.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="flex justify-between">
                <span>Ekip Harcamaları (Onaylı)</span>
                <span>{ekipGiderleri.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="flex justify-between">
                <span>Şirket Giderleri</span>
                <span>{sirketGiderleri.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="flex justify-between">
                <span>Personel Ödemeleri</span>
                <span>{personelOdemeleri.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="flex justify-between">
                <span>Ekip Ödemeleri</span>
                <span>{ekipOdemeleri.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#e3e6f0] flex justify-between font-bold text-[#333]">
              <span>Toplam Gider</span>
              <span>{toplamGider.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-8 h-full flex flex-col justify-center">
            <h3 className="text-lg font-medium text-[#333] mb-4">Kar / Zarar</h3>
            <div className={`text-4xl font-bold ${kar >= 0 ? 'text-[#00a65a]' : 'text-[#dd4b39]'}`}>
              {kar.toLocaleString('tr-TR')} ₺
            </div>
            <p className="text-[#555] text-sm mt-2">Kar Marjı: %{karMarji}</p>
            <p className="text-[#555] text-sm mt-4">
              Fatura tutarı ile tüm giderler (personel, ekip, şirket giderleri ve ödemeler) karşılaştırılarak hesaplanan kar/zarar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
