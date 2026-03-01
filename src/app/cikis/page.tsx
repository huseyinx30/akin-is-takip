'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CikisPage() {
  useEffect(() => {
    const signOut = async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/giris'
    }
    signOut()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <p className="text-slate-400">Çıkış yapılıyor...</p>
    </div>
  )
}
