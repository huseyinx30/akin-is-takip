import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#ecf0f5]">
      <header className="bg-[#3c8dbc] text-white shadow-md">
        <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            İş Takip
          </div>
          <div className="flex gap-3">
            <Link href="/giris" className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-sm font-medium transition-colors">
              Giriş Yap
            </Link>
            <Link href="/kayit" className="px-4 py-2 rounded-lg bg-white text-[#3c8dbc] hover:bg-[#f8f9fc] text-sm font-medium transition-colors">
              Kayıt Ol
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <h1 className="text-3xl font-bold text-[#333] mb-3">İş Takip Sistemi</h1>
          <p className="text-[#555] text-lg mb-8">
            Firma, proje, muhasebe ve personel takibinizi tek platformda yönetin.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/giris"
              className="px-8 py-3 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium transition-colors"
            >
              Giriş Yap
            </Link>
            <Link
              href="/kayit"
              className="px-8 py-3 rounded-lg border-2 border-[#3c8dbc] text-[#3c8dbc] hover:bg-[#3c8dbc]/5 font-medium transition-colors"
            >
              Kayıt Ol
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
