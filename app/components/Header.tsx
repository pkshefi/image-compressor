'use client'
import { motion } from 'framer-motion'
import PresetButtons from './PresetButtons'
import UploadModeButton from './UploadModeButton'

interface HeaderProps {
  preset: 'website' | 'shopify' | 'wordpress' | 'printing';
  setPreset: (preset: 'website' | 'shopify' | 'wordpress' | 'printing') => void;
  uploadMode: 'single' | 'multiple';
  setUploadMode: (mode: 'single' | 'multiple') => void;
}

export default function Header({ preset, setPreset, uploadMode, setUploadMode }: HeaderProps) {
  return (
    <header className="mb-12">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-bold text-on-background mb-6 text-center"
      >
        Image Compressor
      </motion.h1>

      <div className="max-w-2xl mx-auto">
        <PresetButtons />
        <UploadModeButton />
      </div>
    </header>
  )
} 