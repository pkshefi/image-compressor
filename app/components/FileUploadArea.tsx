'use client'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { UploadCloud } from 'lucide-react'

interface FileUploadAreaProps {
  isCompressing: boolean
  isDragActive: boolean
  getRootProps: () => any
  getInputProps: () => any
  uploadMode: 'single' | 'multiple'
  preset: string
}

export default function FileUploadArea({
  isCompressing,
  isDragActive,
  getRootProps,
  getInputProps,
  uploadMode,
  preset
}: FileUploadAreaProps) {
  return (
    <motion.div
      {...getRootProps()}
      className={`group relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-outline'}
        ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <input {...getInputProps()} aria-label="File upload" />
      <div className="space-y-6">
        <div className="flex justify-center">
          <motion.div 
            className="p-5 rounded-full bg-primary/10"
            animate={{ rotate: isCompressing ? 360 : 0 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          >
            <UploadCloud 
              className={`h-10 w-10 ${isCompressing ? 'text-primary' : 'text-outline'}`} 
              strokeWidth={1.5}
            />
          </motion.div>
        </div>
        <div className="space-y-3">
          <p className="text-xl font-semibold text-on-background">
            {isCompressing ? 'Compressing...' : 'Drag & drop images here'}
          </p>
          <p className="text-sm text-on-surface-variant">
            {uploadMode === 'single' ? 'Single file' : 'Multiple files'} • Max 5MB • {preset} preset
          </p>
        </div>
      </div>
    </motion.div>
  )
} 