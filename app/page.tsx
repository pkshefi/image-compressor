'use client'
import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
import { CheckCircle, AlertCircle, Loader2, UploadCloud, ImageIcon, Settings, Download } from 'lucide-react'
import Header from './components/Header'
import FileUploadArea from './components/FileUploadArea'
import CompressedFilesList from './components/CompressedFilesList'
import CompressionHistory from './components/CompressionHistory'

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
    <main className="min-h-screen p-6 md:p-8 max-w-6xl mx-auto bg-background">
      <Toaster position="top-center" />
      
      <Header preset={preset} setPreset={setPreset} uploadMode={uploadMode} setUploadMode={setUploadMode} />

      <FileUploadArea
        isCompressing={isCompressing}
        isDragActive={isDragActive}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        uploadMode={uploadMode}
        preset={preset}
      />

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

      <section className="mt-12 space-y-8">
        {compressedFiles.length > 0 && <CompressedFilesList files={files} compressedFiles={compressedFiles} />}
        {history.length > 0 && <CompressionHistory history={history} />}
      </section>
    </main>
  )
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  return `${(bytes / 1024).toFixed(0)}KB`
}
