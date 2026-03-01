'use client'

import { useState, useEffect } from 'react'
import { Smartphone, X } from 'lucide-react'

export function InstallPrompt() {
  const [isVisible, setIsVisible] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
    const android = /Android/i.test(navigator.userAgent)

    setIsStandalone(standalone)
    setIsAndroid(android)

    if (!standalone && (android || /iPhone|iPad|iPod/.test(navigator.userAgent))) {
      const dismissed = sessionStorage.getItem('install-prompt-dismissed')
      if (!dismissed) {
        setIsVisible(true)
      }
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('install-prompt-dismissed', 'true')
  }

  if (!isVisible || isStandalone) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="flex items-center gap-3 rounded-xl bg-[#3c8dbc] p-4 text-white shadow-lg">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Ana ekrana ekle</p>
          <p className="text-sm text-white/90">
            {isAndroid
              ? 'Chrome menüsünden "Ana ekrana ekle" seçeneğini kullanın'
              : 'Paylaş butonuna tıklayıp "Ana Ekrana Ekle" seçin'}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-lg p-1 hover:bg-white/20"
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
