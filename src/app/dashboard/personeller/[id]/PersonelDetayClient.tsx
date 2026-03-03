'use client'

import { useState, useRef, useEffect } from 'react'
import { PersonelOzetKartlari, type CardFilter } from './PersonelOzetKartlari'
import { OnayBekleyenHarcamalar } from './OnayBekleyenHarcamalar'
import { TumHarcamalar } from './TumHarcamalar'
import { TumOdemeler } from './TumOdemeler'

interface PersonelDetayClientProps {
  personelId: string
  toplamHarcama: number
  onaylananHarcama: number
  bekleyenHarcama: number
  bekleyenAdet: number
  reddedilenHarcama: number
  toplamOdeme: number
  kalanAlacak: number
}

export function PersonelDetayClient({
  personelId,
  toplamHarcama,
  onaylananHarcama,
  bekleyenHarcama,
  bekleyenAdet,
  reddedilenHarcama,
  toplamOdeme,
  kalanAlacak,
}: PersonelDetayClientProps) {
  const [selectedCard, setSelectedCard] = useState<CardFilter>('')
  const odemelerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedCard === 'odeme' && odemelerRef.current) {
      odemelerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedCard])

  const statusFilter: '' | 'onaylandi' | 'beklemede' | 'reddedildi' =
    selectedCard === 'odeme' ? '' : selectedCard === 'kalan' ? 'onaylandi' : selectedCard === 'onaylandi' || selectedCard === 'beklemede' || selectedCard === 'reddedildi' ? selectedCard : ''

  return (
    <>
      <PersonelOzetKartlari
        toplamHarcama={toplamHarcama}
        onaylananHarcama={onaylananHarcama}
        bekleyenHarcama={bekleyenHarcama}
        bekleyenAdet={bekleyenAdet}
        reddedilenHarcama={reddedilenHarcama}
        toplamOdeme={toplamOdeme}
        kalanAlacak={kalanAlacak}
        selectedCard={selectedCard}
        onCardClick={setSelectedCard}
      />

      <OnayBekleyenHarcamalar personelId={personelId} />

      <TumHarcamalar personelId={personelId} statusFilter={statusFilter} />

      <div ref={odemelerRef} className="mt-8">
        <TumOdemeler personelId={personelId} />
      </div>
    </>
  )
}
