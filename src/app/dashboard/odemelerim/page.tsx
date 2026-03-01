import { createClient } from '@/lib/supabase/server'

export default async function OdemelerimPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('id, role').eq('user_id', user.id).single()
  if (!profile) return <div className="p-8 text-[#555]">Profil bulunamadı.</div>

  const table = profile.role === 'personel' ? 'personnel_payments' : 'team_payments'
  const idField = profile.role === 'personel' ? 'personel_id' : 'ekip_id'

  const { data: payments } = await supabase
    .from(table)
    .select('*')
    .eq(idField, profile.id)
    .order('payment_date', { ascending: false })

  const total = payments?.reduce((s, p) => s + Number(p.amount), 0) || 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#333] mb-6">Ödemelerim</h1>
      <p className="text-[#555] text-sm mb-6">Aldığınız ödemelerin listesi</p>

      <div className="mb-6 p-6 bg-white rounded-lg shadow-md border border-[#e3e6f0]">
        <span className="text-[#555]">Toplam Alınan: </span>
        <span className="text-2xl font-bold text-[#00a65a]">{total.toLocaleString('tr-TR')} ₺</span>
      </div>

      <div className="space-y-4">
        {payments?.map((p) => {
          const typeLabels: Record<string, string> = { avans: 'Avans', maas: 'Maaş', hakedis: 'Hakediş', harcama: 'Harcama', diger: 'Diğer' }
          return (
          <div key={p.id} className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6 flex justify-between items-center">
            <div>
              <div className="font-medium text-[#333]">{p.description || typeLabels[p.payment_type] || 'Ödeme'}</div>
              <div className="text-[#555] text-sm mt-1">{p.payment_date} • {typeLabels[p.payment_type] || p.payment_type}</div>
            </div>
            <div className="text-[#00a65a] font-medium">{Number(p.amount).toLocaleString('tr-TR')} ₺</div>
          </div>
        )})}
      </div>

      {(!payments || payments.length === 0) && (
        <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-12 text-center text-[#555]">
          Henüz ödeme kaydınız yok.
        </div>
      )}
    </div>
  )
}
