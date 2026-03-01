'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function OnayBekleyenHarcamalar({ personelId }: { personelId: string }) {
  const [expenses, setExpenses] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    supabase.from('personnel_expenses').select('*').eq('personel_id', personelId).eq('status', 'beklemede').order('expense_date', { ascending: false })
      .then(({ data }) => setExpenses(data || []))
  }, [personelId])

  const handleApprove = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user?.id).single()
    await supabase.from('personnel_expenses').update({ status: 'onaylandi', approved_by: profile?.id, approved_at: new Date().toISOString() }).eq('id', id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  const handleReject = async (id: string) => {
    await supabase.from('personnel_expenses').update({ status: 'reddedildi' }).eq('id', id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  if (expenses.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-[#f39c12] mb-4">Onay Bekleyen Harcamalar</h2>
      <div className="space-y-4">
        {expenses.map((e) => (
          <div key={e.id} className="flex justify-between items-center p-4 bg-white rounded-lg border border-[#f39c12]/40 shadow-sm">
            <div>
              <div className="text-[#333] font-medium">{e.description}</div>
              <div className="text-[#555] text-sm">{e.expense_date} • {Number(e.amount).toLocaleString('tr-TR')} ₺</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleApprove(e.id)} className="px-3 py-1.5 rounded bg-[#00a65a] hover:bg-[#008d4c] text-white text-sm font-medium">Onayla</button>
              <button onClick={() => handleReject(e.id)} className="px-3 py-1.5 rounded bg-[#dd4b39] hover:bg-[#c23321] text-white text-sm font-medium">Reddet</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
