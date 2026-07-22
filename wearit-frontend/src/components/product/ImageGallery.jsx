import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ImageGallery({ images = [], productName = '' }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 })

  // Use placeholder images if no images provided
  const displayImages = images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80']

  const handleMouseMove = (e) => {
    if (!zoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
      {/* Thumbnails */}
      <div className="hidden md:flex flex-col gap-2 order-1 md:order-none">
        {displayImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => { setSelectedIndex(idx); setZoomed(false) }}
            className={`w-full aspect-square overflow-hidden border transition-colors cursor-pointer ${
              idx === selectedIndex ? 'border-foreground' : 'border-border hover:border-zinc-400'
            }`}
          >
            <img
              src={img}
              alt={`${productName} ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="md:col-span-5">
        <div
          className="relative aspect-[3/4] bg-zinc-100 overflow-hidden cursor-crosshair group"
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={displayImages[selectedIndex]}
              alt={productName}
              className="w-full h-full object-cover"
              style={
                zoomed
                  ? { transform: 'scale(2)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                  : {}
              }
            />
          </AnimatePresence>
        </div>

        {/* Mobile thumbnails */}
        <div className="flex gap-2 mt-3 md:hidden overflow-x-auto pb-1">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`w-16 h-16 flex-shrink-0 overflow-hidden border transition-colors cursor-pointer ${
                idx === selectedIndex ? 'border-foreground' : 'border-border'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
