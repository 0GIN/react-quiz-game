/**
 * @fileoverview Komponent do wyboru baneru profilu
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface BannerOption {
  id: number
  name: string
  image_url: string
  category: string
  is_premium: boolean
}

interface BannerSelectorProps {
  currentBanner: string | null
  onSelect: (banner: string) => void
  onClose: () => void
}

export default function BannerSelector({ currentBanner, onSelect, onClose }: BannerSelectorProps) {
  const [banners, setBanners] = useState<BannerOption[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBanner, setSelectedBanner] = useState(currentBanner || '')

  useEffect(() => {
    loadBanners()
  }, [])

  async function loadBanners() {
    try {
      const { data, error } = await supabase
        .from('banner_templates')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error

      setBanners(data || [])
    } catch (error) {
      console.error('Error loading banners:', error)
      // Fallback do domyślnych banerów
      setBanners([
        { id: 1, name: 'Gradient Niebieski', image_url: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', category: 'gradient', is_premium: false },
        { id: 2, name: 'Gradient Zielony', image_url: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)', category: 'gradient', is_premium: false },
        { id: 3, name: 'Gradient Fioletowy', image_url: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', category: 'gradient', is_premium: false },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleSelect() {
    onSelect(selectedBanner)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        overflow: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '24px',
          padding: '32px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '85vh',
          overflow: 'auto',
          border: '2px solid rgba(0, 229, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#fff'
          }}>
            🎨 Wybierz tło baneru
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#B0B0B0',
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Preview */}
        {selectedBanner && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: '#B0B0B0', marginBottom: '8px', fontSize: '14px' }}>Podgląd:</div>
            <div style={{
              height: '120px',
              borderRadius: '12px',
              background: selectedBanner,
              border: '2px solid rgba(255, 255, 255, 0.1)'
            }} />
          </div>
        )}

        {/* Banner grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              border: '4px solid rgba(0,229,255,0.3)',
              borderTop: '4px solid #00E5FF',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: '#B0B0B0' }}>Ładowanie banerów...</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {banners.map((banner) => (
              <button
                key={banner.id}
                onClick={() => setSelectedBanner(banner.image_url)}
                style={{
                  position: 'relative',
                  height: '100px',
                  borderRadius: '12px',
                  background: banner.image_url,
                  border: selectedBanner === banner.image_url
                    ? '3px solid #00E5FF'
                    : '2px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  overflow: 'hidden'
                }}
              >
                {selectedBanner === banner.image_url && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#00E5FF',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0A0A1A',
                    fontWeight: 'bold'
                  }}>
                    ✓
                  </div>
                )}
                {banner.is_premium && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(255, 215, 0, 0.9)',
                    color: '#0A0A1A',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    ⭐ VIP
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  padding: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  textAlign: 'center'
                }}>
                  {banner.name}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#B0B0B0',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Anuluj
          </button>
          <button
            onClick={handleSelect}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#0A0A1A',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Wybierz
          </button>
        </div>
      </div>
    </div>
  )
}
