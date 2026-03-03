'use client'

import { Receipt, CheckCircle, Clock, Wallet, TrendingUp, XCircle } from 'lucide-react'

export type CardFilter = '' | 'onaylandi' | 'beklemede' | 'reddedildi' | 'odeme' | 'kalan'

interface PersonelOzetKartlariProps {
  toplamHarcama: number
  onaylananHarcama: number
  bekleyenHarcama: number
  bekleyenAdet: number
  reddedilenHarcama: number
  toplamOdeme: number
  kalanAlacak: number
  selectedCard: CardFilter
  onCardClick: (filter: CardFilter) => void
}

export function PersonelOzetKartlari({
  toplamHarcama,
  onaylananHarcama,
  bekleyenHarcama,
  bekleyenAdet,
  reddedilenHarcama,
  toplamOdeme,
  kalanAlacak,
  selectedCard,
  onCardClick,
}: PersonelOzetKartlariProps) {
  const cardClass = (isSelected: boolean) =>
    `p-4 rounded-xl cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] h-full min-h-[120px] flex flex-col justify-between text-left ${isSelected ? 'ring-2 ring-[#3c8dbc] shadow-md' : ''}`

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 items-stretch">
      <button
        type="button"
        onClick={() => onCardClick('')}
        className={`bg-white rounded-xl shadow-md border border-[#e3e6f0] ${cardClass(selectedCard === '')}`}
      >
        <p className="text-[#555] text-xs font-medium flex items-center gap-1"><Receipt className="w-4 h-4" /> Toplam Harcama</p>
        <p className="text-[#333] text-lg font-bold mt-1">{toplamHarcama.toLocaleString('tr-TR')} ₺</p>
      </button>
      <button
        type="button"
        onClick={() => onCardClick('onaylandi')}
        className={`bg-white rounded-xl shadow-md border border-[#00a65a]/30 ${cardClass(selectedCard === 'onaylandi')}`}
      >
        <p className="text-[#00a65a] text-xs font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Onaylanan</p>
        <p className="text-[#00a65a] text-lg font-bold mt-1">{onaylananHarcama.toLocaleString('tr-TR')} ₺</p>
      </button>
      <button
        type="button"
        onClick={() => onCardClick('beklemede')}
        className={`bg-white rounded-xl shadow-md border border-[#f39c12]/30 ${cardClass(selectedCard === 'beklemede')}`}
      >
        <p className="text-[#f39c12] text-xs font-medium flex items-center gap-1"><Clock className="w-4 h-4" /> Bekleyen</p>
        <p className="text-[#f39c12] text-lg font-bold mt-1">{bekleyenHarcama.toLocaleString('tr-TR')} ₺</p>
        {bekleyenAdet > 0 && <p className="text-[#f39c12] text-xs mt-0.5">{bekleyenAdet} adet</p>}
      </button>
      <button
        type="button"
        onClick={() => onCardClick('reddedildi')}
        className={`bg-white rounded-xl shadow-md border border-[#dd4b39]/30 ${cardClass(selectedCard === 'reddedildi')}`}
      >
        <p className="text-[#dd4b39] text-xs font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> Reddedilen</p>
        <p className="text-[#dd4b39] text-lg font-bold mt-1">{reddedilenHarcama.toLocaleString('tr-TR')} ₺</p>
      </button>
      <button
        type="button"
        onClick={() => onCardClick('odeme')}
        className={`bg-white rounded-xl shadow-md border border-[#00c0ef]/30 ${cardClass(selectedCard === 'odeme')}`}
      >
        <p className="text-[#00c0ef] text-xs font-medium flex items-center gap-1"><Wallet className="w-4 h-4" /> Alınan Ödeme</p>
        <p className="text-[#00c0ef] text-lg font-bold mt-1">{toplamOdeme.toLocaleString('tr-TR')} ₺</p>
      </button>
      <button
        type="button"
        onClick={() => onCardClick('kalan')}
        className={`bg-white rounded-xl shadow-md border border-[#605ca8]/30 ${cardClass(selectedCard === 'kalan')}`}
      >
        <p className="text-[#605ca8] text-xs font-medium flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Kalan Alacak</p>
        <p className={`text-lg font-bold mt-1 ${kalanAlacak >= 0 ? 'text-[#605ca8]' : 'text-[#dd4b39]'}`}>{kalanAlacak.toLocaleString('tr-TR')} ₺</p>
      </button>
    </div>
  )
}
