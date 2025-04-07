'use client'

interface UploadModeButtonProps {
  uploadMode: 'single' | 'bulk'
  setUploadMode: (mode: 'single' | 'bulk') => void
}

export default function UploadModeButton({ uploadMode, setUploadMode }: UploadModeButtonProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-on-background mb-3">Upload Mode</h2>
      <button
        onClick={() => setUploadMode(mode => mode === 'single' ? 'bulk' : 'single')}
        className="w-full p-3 rounded-xl bg-surface-container-highest text-on-surface-variant text-sm font-medium hover:bg-surface-container-high transition-colors"
      >
        {uploadMode === 'single' ? 'Single File Mode' : 'Bulk Upload Mode'}
      </button>
    </div>
  )
} 