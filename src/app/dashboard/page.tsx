import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
import {
  Building2,
  FolderKanban,
  FileText,
  ShoppingBag,
  BarChart2,
  UserPlus,
  PieChart,
  AlertCircle,
  ArrowRight,
  CreditCard,
  ClipboardList,
  Banknote,
  TrendingUp,
  Clock,
  CheckCircle,
  Wallet,
  Receipt,
  XCircle,
} from 'lucide-react'
import { AdminDashboardChart } from '@/components/AdminDashboardChart'
import { KalanOdemeKarti } from '@/components/KalanOdemeKarti'
import { PersonelEkipChart } from '@/components/PersonelEkipChart'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('user_id', user!.id)
    .single()

  const role = profile?.role || 'personel'

  let personelEkipStats = null
  if (role === 'personel' || role === 'ekip') {
    const { data: prof } = await supabase.from('profiles').select('id').eq('user_id', user!.id).single()
    if (prof) {
      const expTable = role === 'personel' ? 'personnel_expenses' : 'team_expenses'
      const payTable = role === 'personel' ? 'personnel_payments' : 'team_payments'
      const idField = role === 'personel' ? 'personel_id' : 'ekip_id'

      const [
        allExpenses,
        allPayments,
        recentExpenses,
        recentPayments,
      ] = await Promise.all([
        supabase.from(expTable).select('amount, status').eq(idField, prof.id),
        supabase.from(payTable).select('amount').eq(idField, prof.id),
        supabase.from(expTable).select('id, amount, expense_date, category, status').eq(idField, prof.id).order('expense_date', { ascending: false }).limit(3),
        supabase.from(payTable).select('id, amount, payment_date, description, payment_type').eq(idField, prof.id).order('payment_date', { ascending: false }).limit(3),
      ])

      const expenses = allExpenses.data || []
      const payments = allPayments.data || []
      const toplamHarcama = expenses.reduce((s, e) => s + Number(e.amount), 0)
      const onaylananHarcama = expenses.filter((e) => e.status === 'onaylandi').reduce((s, e) => s + Number(e.amount), 0)
      const bekleyenHarcama = expenses.filter((e) => e.status === 'beklemede').reduce((s, e) => s + Number(e.amount), 0)
      const bekleyenAdet = expenses.filter((e) => e.status === 'beklemede').length
      const reddedilenHarcama = expenses.filter((e) => e.status === 'reddedildi').reduce((s, e) => s + Number(e.amount), 0)
      const reddedilenAdet = expenses.filter((e) => e.status === 'reddedildi').length
      const toplamOdeme = payments.reduce((s, p) => s + Number(p.amount), 0)
      const kalanAlacak = onaylananHarcama - toplamOdeme

      personelEkipStats = {
        toplamHarcama,
        onaylananHarcama,
        bekleyenHarcama,
        bekleyenAdet,
        reddedilenHarcama,
        reddedilenAdet,
        toplamOdeme,
        kalanAlacak,
        recentExpenses: recentExpenses.data || [],
        recentPayments: recentPayments.data || [],
      }
    }
  }

  let adminStats = null
  if (role === 'admin') {
    const [
      companiesRes,
      projectsRes,
      invoicesRes,
      invoicesDataRes,
      personnelExpRes,
      teamExpRes,
      companyExpRes,
      personnelPayRes,
      teamPayRes,
      pendingPersonnelRes,
      pendingTeamRes,
      recentInvoicesRes,
      recentProjectsRes,
    ] = await Promise.all([
      supabase.from('companies').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('invoices').select('id', { count: 'exact', head: true }),
      supabase.from('invoices').select('total_amount'),
      supabase.from('personnel_expenses').select('amount').eq('status', 'onaylandi'),
      supabase.from('team_expenses').select('amount').eq('status', 'onaylandi'),
      supabase.from('company_expenses').select('amount'),
      supabase.from('personnel_payments').select('amount'),
      supabase.from('team_payments').select('amount'),
      supabase.from('personnel_expenses').select('id', { count: 'exact', head: true }).eq('status', 'beklemede'),
      supabase.from('team_expenses').select('id', { count: 'exact', head: true }).eq('status', 'beklemede'),
      supabase.from('invoices').select('id, invoice_no, total_amount, invoice_date, companies(name)').order('invoice_date', { ascending: false }).limit(5),
      supabase.from('projects').select('id, name, status, companies(name), cities(name)').order('created_at', { ascending: false }).limit(5),
    ])

    const toplamGelir = (invoicesDataRes.data || []).reduce((s, i) => s + Number(i.total_amount), 0)
    const personelGider = (personnelExpRes.data || []).reduce((s, e) => s + Number(e.amount), 0)
    const ekipGider = (teamExpRes.data || []).reduce((s, e) => s + Number(e.amount), 0)
    const sirketGider = (companyExpRes.data || []).reduce((s, e) => s + Number(e.amount), 0)
    const personelOdeme = (personnelPayRes.data || []).reduce((s, p) => s + Number(p.amount), 0)
    const ekipOdeme = (teamPayRes.data || []).reduce((s, p) => s + Number(p.amount), 0)
    const toplamGider = personelGider + ekipGider + sirketGider + personelOdeme + ekipOdeme
    const kar = toplamGelir - toplamGider
    const pendingCount = (pendingPersonnelRes.count || 0) + (pendingTeamRes.count || 0)

    adminStats = {
      companies: companiesRes.count || 0,
      projects: projectsRes.count || 0,
      invoices: invoicesRes.count || 0,
      toplamGelir,
      toplamGider,
      kar,
      pendingCount,
      recentInvoices: recentInvoicesRes.data || [],
      recentProjects: recentProjectsRes.data || [],
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#333]">Dashboard</h1>
        <p className="text-[#555] text-sm">Kontrol paneli</p>
      </div>

      {role === 'admin' && adminStats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Link href="/dashboard/firmalar" className="block">
              <div className="bg-[#00c0ef] rounded-lg p-4 text-white hover:opacity-95 transition-opacity">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/90 text-sm">Firmalar</p>
                    <p className="text-2xl font-bold mt-1">{adminStats.companies}</p>
                    <p className="text-xs mt-2 text-white/80">Firma sayısı</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-2">
                    <Building2 className="w-8 h-8" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm font-medium">
                  <span>Detay</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>

            <Link href="/dashboard/projeler" className="block">
              <div className="bg-[#00a65a] rounded-lg p-4 text-white hover:opacity-95 transition-opacity">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/90 text-sm">Projeler</p>
                    <p className="text-2xl font-bold mt-1">{adminStats.projects}</p>
                    <p className="text-xs mt-2 text-white/80">Aktif proje</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-2">
                    <BarChart2 className="w-8 h-8" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm font-medium">
                  <span>Detay</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>

            <Link href="/dashboard/faturalar" className="block">
              <div className="bg-[#f39c12] rounded-lg p-4 text-white hover:opacity-95 transition-opacity">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/90 text-sm">Faturalar</p>
                    <p className="text-2xl font-bold mt-1">{adminStats.invoices}</p>
                    <p className="text-xs mt-2 text-white/80">Kesilen fatura</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-2">
                    <UserPlus className="w-8 h-8" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm font-medium">
                  <span>Detay</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>

            <Link href="/dashboard/personeller" className="block">
              <div className="bg-[#dd4b39] rounded-lg p-4 text-white hover:opacity-95 transition-opacity">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/90 text-sm">Onay Bekleyen</p>
                    <p className="text-2xl font-bold mt-1">{adminStats.pendingCount}</p>
                    <p className="text-xs mt-2 text-white/80">Harcama onayı</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-2">
                    <PieChart className="w-8 h-8" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm font-medium">
                  <span>Onayla</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md border border-[#e3e6f0] overflow-hidden">
              <div className="px-4 py-3 rounded-t-lg bg-white border-b border-[#e3e6f0]">
                <h3 className="font-semibold text-[#333]">Gelir / Gider Özeti</h3>
              </div>
              <div className="p-4">
                <AdminDashboardChart gelir={adminStats.toplamGelir} gider={adminStats.toplamGider} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#00a65a]/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#00a65a]">₺</span>
                  </div>
                  <div>
                    <p className="text-[#555] text-sm">Toplam Gelir</p>
                    <p className="text-xl font-bold text-[#333]">{adminStats.toplamGelir.toLocaleString('tr-TR')} ₺</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#dd4b39]/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#dd4b39]">₺</span>
                  </div>
                  <div>
                    <p className="text-[#555] text-sm">Toplam Gider</p>
                    <p className="text-xl font-bold text-[#333]">{adminStats.toplamGider.toLocaleString('tr-TR')} ₺</p>
                  </div>
                </div>
              </div>
              <div className={`rounded-lg shadow-md border p-4 ${adminStats.kar >= 0 ? 'bg-[#00a65a]/10 border-[#00a65a]/30' : 'bg-[#dd4b39]/10 border-[#dd4b39]/30'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${adminStats.kar >= 0 ? 'bg-[#00a65a]/20' : 'bg-[#dd4b39]/20'}`}>
                    <span className={`text-sm font-bold ${adminStats.kar >= 0 ? 'text-[#00a65a]' : 'text-[#dd4b39]'}`}>₺</span>
                  </div>
                  <div>
                    <p className={`text-sm ${adminStats.kar >= 0 ? 'text-[#00a65a]' : 'text-[#dd4b39]'}`}>Net Kar / Zarar</p>
                    <p className={`text-xl font-bold ${adminStats.kar >= 0 ? 'text-[#00a65a]' : 'text-[#dd4b39]'}`}>
                      {adminStats.kar.toLocaleString('tr-TR')} ₺
                    </p>
                  </div>
                </div>
              </div>
              <KalanOdemeKarti />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] overflow-hidden">
              <div className="px-4 py-3 rounded-t-lg bg-white border-b border-[#e3e6f0] flex justify-between items-center">
                <h3 className="font-semibold text-[#333]">Son Faturalar</h3>
                <Link href="/dashboard/faturalar" className="text-[#3c8dbc] text-sm hover:underline">
                  Tümünü gör →
                </Link>
              </div>
              <div className="p-4">
                {adminStats.recentInvoices.length > 0 ? (
                  <div className="space-y-2">
                    {adminStats.recentInvoices.map((inv: any) => (
                      <Link
                        key={inv.id}
                        href="/dashboard/faturalar"
                        className="flex items-center justify-between p-3 rounded-lg bg-[#f8f9fc] hover:bg-[#ecf0f5] transition-colors"
                      >
                        <div>
                          <p className="font-medium text-[#333]">{inv.invoice_no}</p>
                          <p className="text-[#555] text-sm">{inv.companies?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#00a65a]">{Number(inv.total_amount).toLocaleString('tr-TR')} ₺</p>
                          <p className="text-[#555] text-xs">{inv.invoice_date}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#555] text-center py-8">Henüz fatura yok</p>
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] overflow-hidden">
              <div className="px-4 py-3 rounded-t-lg bg-white border-b border-[#e3e6f0] flex justify-between items-center">
                <h3 className="font-semibold text-[#333]">Son Projeler</h3>
                <Link href="/dashboard/projeler" className="text-[#3c8dbc] text-sm hover:underline">
                  Tümünü gör →
                </Link>
              </div>
              <div className="p-4">
                {adminStats.recentProjects.length > 0 ? (
                  <div className="space-y-2">
                    {adminStats.recentProjects.map((proj: any) => (
                      <Link
                        key={proj.id}
                        href="/dashboard/projeler"
                        className="flex items-center justify-between p-3 rounded-lg bg-[#f8f9fc] hover:bg-[#ecf0f5] transition-colors"
                      >
                        <div>
                          <p className="font-medium text-[#333]">{proj.name}</p>
                          <p className="text-[#555] text-sm">{proj.companies?.name} • {proj.cities?.name}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          proj.status === 'aktif' ? 'bg-[#00a65a]/20 text-[#00a65a]' :
                          proj.status === 'tamamlandi' ? 'bg-[#555]/20 text-[#555]' : 'bg-[#f39c12]/20 text-[#f39c12]'
                        }`}>
                          {proj.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#555] text-center py-8">Henüz proje yok</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {(role === 'personel' || role === 'ekip') && personelEkipStats && (
        <>
          {/* Özet Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6 items-stretch">
            <Link href="/dashboard/harcamalarim" className="block h-full">
              <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] p-5 h-full min-h-[165px] flex flex-col hover:shadow-lg hover:border-[#dd4b39]/30 transition-all">
                <div className="flex justify-between items-start flex-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-[#555] text-sm font-medium">Toplam Harcama</p>
                    <p className="text-xl font-bold text-[#333] mt-1 break-keep">{personelEkipStats.toplamHarcama.toLocaleString('tr-TR')} ₺</p>
                    <p className="text-xs text-[#555] mt-1">Tüm harcamalar</p>
                  </div>
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-[#dd4b39]/15 flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-[#dd4b39]" />
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/harcamalarim" className="block h-full">
              <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] p-5 h-full min-h-[165px] flex flex-col hover:shadow-lg hover:border-[#00a65a]/30 transition-all">
                <div className="flex justify-between items-start flex-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-[#555] text-sm font-medium">Onaylanan Harcama</p>
                    <p className="text-xl font-bold text-[#00a65a] mt-1 break-keep">{personelEkipStats.onaylananHarcama.toLocaleString('tr-TR')} ₺</p>
                    <p className="text-xs text-[#555] mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 shrink-0" /> Onaylı
                    </p>
                  </div>
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-[#00a65a]/15 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-[#00a65a]" />
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/harcamalarim" className="block h-full">
              <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] p-5 h-full min-h-[165px] flex flex-col hover:shadow-lg hover:border-[#f39c12]/30 transition-all">
                <div className="flex justify-between items-start flex-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-[#555] text-sm font-medium">Bekleyen Harcama</p>
                    <p className="text-xl font-bold text-[#f39c12] mt-1 break-keep">{personelEkipStats.bekleyenHarcama.toLocaleString('tr-TR')} ₺</p>
                    <p className="text-xs text-[#555] mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" /> {personelEkipStats.bekleyenAdet} adet
                    </p>
                  </div>
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-[#f39c12]/15 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#f39c12]" />
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/harcamalarim?durum=reddedildi" className="block h-full">
              <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] p-5 h-full min-h-[165px] flex flex-col hover:shadow-lg hover:border-[#dd4b39]/30 transition-all">
                <div className="flex justify-between items-start flex-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-[#555] text-sm font-medium">Reddedilen Harcama</p>
                    <p className="text-xl font-bold text-[#dd4b39] mt-1 break-keep">{personelEkipStats.reddedilenHarcama.toLocaleString('tr-TR')} ₺</p>
                    <p className="text-xs text-[#555] mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3 shrink-0" /> {personelEkipStats.reddedilenAdet} adet
                    </p>
                  </div>
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-[#dd4b39]/15 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-[#dd4b39]" />
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/odemelerim" className="block h-full">
              <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] p-5 h-full min-h-[165px] flex flex-col hover:shadow-lg hover:border-[#00c0ef]/30 transition-all">
                <div className="flex justify-between items-start flex-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-[#555] text-sm font-medium">Alınan Ödemeler</p>
                    <p className="text-xl font-bold text-[#00c0ef] mt-1 break-keep">{personelEkipStats.toplamOdeme.toLocaleString('tr-TR')} ₺</p>
                    <p className="text-xs text-[#555] mt-1">Toplam tahsilat</p>
                  </div>
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-[#00c0ef]/15 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-[#00c0ef]" />
                  </div>
                </div>
              </div>
            </Link>

            <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] p-5 h-full min-h-[165px] flex flex-col">
              <div className="flex justify-between items-start flex-1">
                <div className="min-w-0 flex-1">
                  <p className="text-[#555] text-sm font-medium">Kalan Alacak</p>
                  <p className={`text-xl font-bold mt-1 break-keep ${personelEkipStats.kalanAlacak >= 0 ? 'text-[#3c8dbc]' : 'text-[#dd4b39]'}`}>
                    {personelEkipStats.kalanAlacak.toLocaleString('tr-TR')} ₺
                  </p>
                  <p className="text-xs text-[#555] mt-1">
                    {personelEkipStats.kalanAlacak >= 0 ? 'Onaylı harcama - Ödeme' : 'Fazla ödeme'}
                  </p>
                </div>
                <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${personelEkipStats.kalanAlacak >= 0 ? 'bg-[#3c8dbc]/15' : 'bg-[#dd4b39]/15'}`}>
                  <TrendingUp className={`w-6 h-6 ${personelEkipStats.kalanAlacak >= 0 ? 'text-[#3c8dbc]' : 'text-[#dd4b39]'}`} />
                </div>
              </div>
            </div>

          </div>

          {/* Grafik ve Hızlı İşlemler */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-[#e3e6f0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e3e6f0]">
                <h3 className="font-semibold text-[#333]">Harcama / Ödeme Özeti</h3>
                <p className="text-[#555] text-sm mt-0.5">Onaylanan harcamalar ile alınan ödemeler</p>
              </div>
              <div className="p-4">
                <PersonelEkipChart onaylananHarcama={personelEkipStats.onaylananHarcama} toplamOdeme={personelEkipStats.toplamOdeme} />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-[#333]">Hızlı İşlemler</h3>
              <Link href="/dashboard/is-kayitlarim" className="block">
                <div className="bg-[#00c0ef]/10 border border-[#00c0ef]/30 rounded-xl p-4 hover:bg-[#00c0ef]/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00c0ef]/20 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-[#00c0ef]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#333]">İş Kaydı Ekle</p>
                      <p className="text-[#555] text-sm">Yaptığınız işi kaydedin</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#00c0ef] ml-auto" />
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/harcamalarim" className="block">
                <div className="bg-[#00a65a]/10 border border-[#00a65a]/30 rounded-xl p-4 hover:bg-[#00a65a]/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00a65a]/20 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-[#00a65a]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#333]">Harcama Ekle</p>
                      <p className="text-[#555] text-sm">Yakıt, yemek vb.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#00a65a] ml-auto" />
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/projeler" className="block">
                <div className="bg-[#605ca8]/10 border border-[#605ca8]/30 rounded-xl p-4 hover:bg-[#605ca8]/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#605ca8]/20 flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-[#605ca8]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#333]">Projelerim</p>
                      <p className="text-[#555] text-sm">Atandığınız projeler</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#605ca8] ml-auto" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Son İşlemler */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e3e6f0] flex justify-between items-center">
                <h3 className="font-semibold text-[#333]">Son Harcamalar</h3>
                <Link href="/dashboard/harcamalarim" className="text-[#3c8dbc] text-sm hover:underline">Tümü →</Link>
              </div>
              <div className="p-4">
                {personelEkipStats.recentExpenses.length > 0 ? (
                  <div className="space-y-2">
                    {personelEkipStats.recentExpenses.map((e: any) => {
                      const catLabels: Record<string, string> = { yakit: 'Yakıt', yemek: 'Yemek', konaklama: 'Konaklama', ulasim: 'Ulaşım', diger: 'Diğer', demirbas: 'Demirbaş', giyim: 'Giyim', arac_vergi: 'Araç Vergisi' }
                      return (
                      <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-[#f8f9fc] hover:bg-[#ecf0f5]">
                        <div>
                          <p className="font-medium text-[#333]">{catLabels[e.category] || e.category} • {e.expense_date}</p>
                          <span className={`text-xs px-2 py-0.5 rounded ${e.status === 'onaylandi' ? 'bg-[#00a65a]/20 text-[#00a65a]' : e.status === 'beklemede' ? 'bg-[#f39c12]/20 text-[#f39c12]' : 'bg-[#dd4b39]/20 text-[#dd4b39]'}`}>
                            {e.status === 'onaylandi' ? 'Onaylı' : e.status === 'beklemede' ? 'Beklemede' : 'Reddedildi'}
                          </span>
                        </div>
                        <p className="font-semibold text-[#dd4b39]">{Number(e.amount).toLocaleString('tr-TR')} ₺</p>
                      </div>
                    )})}
                  </div>
                ) : (
                  <p className="text-[#555] text-center py-8 text-sm">Henüz harcama yok</p>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e3e6f0] flex justify-between items-center">
                <h3 className="font-semibold text-[#333]">Son Ödemeler</h3>
                <Link href="/dashboard/odemelerim" className="text-[#3c8dbc] text-sm hover:underline">Tümü →</Link>
              </div>
              <div className="p-4">
                {personelEkipStats.recentPayments.length > 0 ? (
                  <div className="space-y-2">
                    {personelEkipStats.recentPayments.map((p: any) => {
                      const payLabels: Record<string, string> = { avans: 'Avans', maas: 'Maaş', hakedis: 'Hakediş', harcama: 'Harcama', diger: 'Diğer' }
                      return (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-[#f8f9fc] hover:bg-[#ecf0f5]">
                        <div>
                          <p className="font-medium text-[#333]">{p.description || payLabels[p.payment_type] || p.payment_type || 'Ödeme'}</p>
                          <p className="text-[#555] text-xs">{p.payment_date} • {payLabels[p.payment_type] || p.payment_type}</p>
                        </div>
                        <p className="font-semibold text-[#00a65a]">{Number(p.amount).toLocaleString('tr-TR')} ₺</p>
                      </div>
                    )})}
                  </div>
                ) : (
                  <p className="text-[#555] text-center py-8 text-sm">Henüz ödeme yok</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {(role === 'personel' || role === 'ekip') && !personelEkipStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/is-kayitlarim" className="block">
            <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-[#00c0ef]/20 flex items-center justify-center">
                  <ClipboardList className="w-7 h-7 text-[#00c0ef]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#333]">İş Kayıtlarım</h3>
                  <p className="text-[#555] text-sm">Yaptığınız işleri kaydedin</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-[#3c8dbc] text-sm font-medium">
                <span>Git</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>
          <Link href="/dashboard/harcamalarim" className="block">
            <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-[#00a65a]/20 flex items-center justify-center">
                  <CreditCard className="w-7 h-7 text-[#00a65a]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#333]">Harcamalarım</h3>
                  <p className="text-[#555] text-sm">Yakıt, yemek vb. harcamalar</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-[#3c8dbc] text-sm font-medium">
                <span>Git</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>
          <Link href="/dashboard/odemelerim" className="block">
            <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-[#f39c12]/20 flex items-center justify-center">
                  <Banknote className="w-7 h-7 text-[#f39c12]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#333]">Ödemelerim</h3>
                  <p className="text-[#555] text-sm">Aldığınız ödemeleri görün</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-[#3c8dbc] text-sm font-medium">
                <span>Git</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
