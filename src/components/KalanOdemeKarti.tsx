'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function KalanOdemeKarti() {
  const [kalanTutar, setKalanTutar] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/kalan-odeme')
      .then((res) => res.json())
      .then((data) => {
        if (data.kalanTutar != null) setKalanTutar(data.kalanTutar)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <Link href="/dashboard/hakedisler" className="block">
      <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-4 hover:border-[#3c8dbc]/50 hover:shadow-lg transition-all">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#3c8dbc]/20 flex items-center justify-center">
            <span className="text-sm font-bold text-[#3c8dbc]">₺</span>
          </div>
          <div>
            <p className="text-[#555] text-sm">Kalan Ödeme Tutarı</p>
            <p className="text-xl font-bold text-[#333]">
              {loading ? '...' : kalanTutar != null ? kalanTutar.toLocaleString('tr-TR') : '0'} ₺
            </p>
            <p className="text-xs text-[#3c8dbc] mt-0.5">Hakedişlerde detay →</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
