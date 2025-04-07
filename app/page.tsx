'use client'
import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
import { CheckCircle, AlertCircle, Loader2, UploadCloud, ImageIcon, Settings, Download } from 'lucide-react'

type FileWithPreview = File & { preview: string }
type CompressionPreset = 'website' | 'shopify' | 'wordpress' | 'printing'
type CompressionHistory = {
  originalName: string
  compressedSize: number
  originalSize: number
  timestamp: number
}

const PRESET_CONFIG = {
  website: { maxSizeMB: 0.5, maxWidthOrHeight: 1200 },
  shopify: { maxSizeMB: 1, maxWidthOrHeight: 2048 },
  wordpress: { maxSizeMB: 0.8, maxWidthOrHeight: 1600 },
  printing: { maxSizeMB: 3, maxWidthOrHeight: 3000 }
}

export default function Home() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [compressedFiles, setCompressedFiles] = useState<File[]>([])
  const [history, setHistory] = useState<CompressionHistory[]>([])
  const [isCompressing, setIsCompressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preset, setPreset] = useState<CompressionPreset>('website')
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('bulk')

  useEffect(() => {
    const savedHistory = localStorage.getItem('compressionHistory')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (isCompressing) return
    
    const invalidFiles = acceptedFiles.filter(file => {
      if (!file.type.startsWith('image/')) return true
      if (file.size > 5 * 1024 * 1024) return true
      return false
    })

    if (invalidFiles.length > 0) {
      toast.error('Only image files under 5MB are allowed')
      return
    }

    const filesToProcess = uploadMode === 'single' ? [acceptedFiles[0]] : acceptedFiles
    const filesWithPreview = filesToProcess.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }))

    setFiles(filesWithPreview)
    setIsCompressing(true)
    
    try {
      const compressed = await Promise.all(
        filesWithPreview.map(async (file) => {
          const options = {
            ...PRESET_CONFIG[preset],
            useWebWorker: true,
            onProgress: (percentage: number) => setProgress(percentage)
          }
          const compressedFile = await imageCompression(file, options)
          
          setHistory(prev => {
            const newHistory = [...prev, {
              originalName: file.name,
              compressedSize: compressedFile.size,
              originalSize: file.size,
              timestamp: Date.now()
            }]
            localStorage.setItem('compressionHistory', JSON.stringify(newHistory))
            return newHistory
          })

          return compressedFile
        })
      )
      setCompressedFiles(compressed)
      toast.success(`${compressed.length} images compressed successfully!`)
    } catch (err) {
      toast.error('Compression failed. Please try again.')
    } finally {
      setIsCompressing(false)
      setProgress(0)
    }
  }, [isCompressing, preset, uploadMode])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxSize: 5 * 1024 * 1024,
    multiple: uploadMode === 'bulk',
    disabled: isCompressing
  })

  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview))
  }, [files])

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto bg-background">
      <Toaster position="top-center" />
      
      <header className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-medium text-on-background mb-4"
        >
          Image Compressor
        </motion.h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.keys(PRESET_CONFIG).map((key) => (
              <button
                key={key}
                onClick={() => setPreset(key as CompressionPreset)}
                className={`p-2 rounded-lg text-sm transition-colors
                  ${preset === key 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setUploadMode(mode => mode === 'single' ? 'bulk' : 'single')}
            className="p-2 rounded-lg bg-surface-container-highest text-on-surface-variant text-sm hover:bg-surface-container-high transition-colors"
          >
            Mode: {uploadMode === 'single' ? 'Single File' : 'Bulk Upload'}
          </button>
        </div>
      </header>

      <motion.div
        {...getRootProps()}
        className={`group relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-outline'}
          ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input {...getInputProps()} aria-label="File upload" />
        <div className="space-y-4">
          <div className="flex justify-center">
            <motion.div 
              className="p-4 rounded-full bg-primary/10"
              animate={{ rotate: isCompressing ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            >
              <UploadCloud 
                className={`h-8 w-8 ${isCompressing ? 'text-primary' : 'text-outline'}`} 
                strokeWidth={1.5}
              />
            </motion.div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-on-background">
              {isCompressing ? 'Compressing...' : 'Drag & drop images here'}
            </p>
            <p className="text-sm text-on-surface-variant">
              {uploadMode === 'single' ? 'Single file' : 'Multiple files'} • Max 5MB • {preset} preset
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isCompressing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 space-y-4"
          >
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-on-surface-variant">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing {files.length} {files.length > 1 ? 'files' : 'file'}...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="mt-8 space-y-6">
        {compressedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-medium text-on-background mb-4">Compressed Files</h2>
            <div className="grid gap-4">
              {compressedFiles.map((file, index) => (
                <motion.div
                  key={file.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-surface-container-lowest rounded-xl shadow-elevation-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-on-surface-variant" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-on-background truncate">{files[index].name}</p>
                      <p className="text-sm text-on-surface-variant">
                        {formatSize(files[index].size)} → {formatSize(file.size)}
                        <span className="mx-2">•</span>
                        {Math.round((1 - file.size / files[index].size) * 100)}% smaller
                      </p>
                    </div>
                    
                    <a
                      href={URL.createObjectURL(file)}
                      download={`compressed_${file.name}`}
                      className="ml-4 px-4 py-2 bg-primary text-on-primary rounded-full shadow-elevation-1 hover:shadow-elevation-2 transition-all flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden md:inline">Download</span>
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-surface-container-lowest rounded-xl p-4"
          >
            <h3 className="text-lg font-medium text-on-background mb-4">History</h3>
            <div className="space-y-3">
              {history.slice(-5).reverse().map((item, index) => (
                <div 
                  key={item.timestamp}
                  className="flex items-center justify-between p-3 bg-surface-container-high rounded-lg"
                >
                  <div>
                    <p className="text-on-background truncate">{item.originalName}</p>
                    <p className="text-sm text-on-surface-variant">
                      {formatSize(item.compressedSize)} • {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm text-primary">
                    -{Math.round((1 - item.compressedSize / item.originalSize) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </section>

      <AnimatePresence>
        {files.length === 0 && !isCompressing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-12 text-center text-on-surface-variant"
          >
            <div className="mb-4 inline-block rounded-xl p-4 bg-surface-container-highest">
              <ImageIcon className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-lg">Drop images to compress</p>
            <p className="text-sm">Supports JPEG, PNG • {PRESET_CONFIG[preset].maxSizeMB}MB max</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  return `${(bytes / 1024).toFixed(0)}KB`
}
