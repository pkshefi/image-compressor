'use client'
import { CompressionPreset } from '../page'

interface PresetButtonsProps {
  preset: CompressionPreset
  setPreset: (preset: CompressionPreset) => void
}

export default function PresetButtons({ preset, setPreset }: PresetButtonsProps) {
  const PRESET_CONFIG = {
    website: { maxSizeMB: 0.5, maxWidthOrHeight: 1200 },
    shopify: { maxSizeMB: 1, maxWidthOrHeight: 2048 },
    wordpress: { maxSizeMB: 0.8, maxWidthOrHeight: 1600 },
    printing: { maxSizeMB: 3, maxWidthOrHeight: 3000 }
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-on-background mb-3">Compression Presets</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.keys(PRESET_CONFIG).map((key) => (
          <button
            key={key}
            onClick={() => setPreset(key as CompressionPreset)}
            className={`p-3 rounded-xl text-sm font-medium transition-all
              ${preset === key 
                ? 'bg-primary text-on-primary shadow-lg' 
                : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
} 