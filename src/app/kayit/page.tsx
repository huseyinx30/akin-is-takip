'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

export default function KayitPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'personel' | 'ekip'>('personel')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-[#ecf0f5]">
        <header className="bg-[#3c8dbc] text-white shadow-md">
          <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              İş Takip
            </Link>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-8 max-w-md text-center">
            <div className="w-16 h-16 rounded-lg bg-[#00a65a]/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-[#00a65a]">✓</span>
            </div>
            <h2 className="text-xl font-bold text-[#333] mb-2">Kayıt Başarılı!</h2>
            <p className="text-[#555] mb-6">Hesabınız oluşturuldu. Giriş yaparak devam edebilirsiniz.</p>
            <Link
              href="/giris"
              className="inline-block px-6 py-3 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium transition-colors"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#ecf0f5]">
      <header className="bg-[#3c8dbc] text-white shadow-md">
        <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            İş Takip
          </Link>
          <Link href="/giris" className="text-sm text-white/90 hover:text-white">
            Giriş Yap
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] overflow-hidden">
            <div className="bg-[#f8f9fc] px-6 py-4 border-b border-[#e3e6f0]">
              <h1 className="text-xl font-bold text-[#333]">Kayıt Ol</h1>
              <p className="text-[#555] text-sm mt-0.5">Yeni hesap oluşturun</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-[#dd4b39]/10 border border-[#dd4b39]/30 text-[#dd4b39] text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Ad Soyad</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] placeholder-[#999] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]"
                  placeholder="Ad Soyad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">E-posta</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] placeholder-[#999] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]"
                  placeholder="ornek@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Şifre</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] placeholder-[#999] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]"
                  placeholder="En az 6 karakter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Rol</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'personel' | 'ekip')}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white"
                >
                  <option value="personel">Personel</option>
                  <option value="ekip">Ekip</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
              </button>
            </form>
            <div className="px-6 pb-6 pt-0">
              <p className="text-center text-[#555] text-sm">
                Zaten hesabınız var mı?{' '}
                <Link href="/giris" className="text-[#3c8dbc] font-medium hover:underline">
                  Giriş yapın
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
