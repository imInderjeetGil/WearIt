import { useState } from 'react'
import API_BASE from '../config'

function TryOnModal({ isOpen, onClose, productId, productName }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resultImage, setResultImage] = useState(null)

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setResultImage(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return alert("Please select your photo first!")
    setLoading(true)
    const formData = new FormData()
    formData.append("user_image", file)

    try {
      const response = await fetch(`${API_BASE}/ai/tryon?product_id=${productId}`, {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      if (data.success) {
        setResultImage(data.processed_image_url)
      } else {
        alert("Try-On failed, please try again.")
      }
    } catch (err) {
      console.error("Tryon error:", err)
      alert("Could not connect to the server!")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setResultImage(null)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full relative text-center shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 bg-transparent border-none text-xl cursor-pointer">
          &times;
        </button>

        <h3 className="text-lg font-extrabold text-dark mb-1">AI Virtual Try-On</h3>
        <p className="text-sm text-zinc-500 mb-6">
          See how <strong className="text-dark">{productName}</strong> looks on you instantly!
        </p>

        {/* Preview Images */}
        {(preview || resultImage) && (
          <div className="flex gap-4 justify-center mb-5">
            {preview && (
              <div>
                <p className="text-[11px] font-bold text-zinc-500 mb-1">Your Photo</p>
                <img src={preview} alt="You" className="w-32 h-44 object-cover rounded-xl border-2 border-dashed border-border" />
              </div>
            )}
            {resultImage && (
              <div>
                <p className="text-[11px] font-bold text-brand mb-1">Try-On Result</p>
                <img src={resultImage} alt="Result" className="w-32 h-44 object-cover rounded-xl border-2 border-brand" />
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        {!resultImage && (
          <div className="mb-4">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="tryon-file-input" />
            <label htmlFor="tryon-file-input" className="inline-block bg-rose-50 text-brand text-sm font-semibold px-5 py-2.5 rounded-xl border border-brand-light cursor-pointer hover:bg-rose-100 transition-colors">
              {preview ? 'Change Photo' : 'Upload Your Photo'}
            </label>
          </div>
        )}

        {preview && !resultImage && (
          <button onClick={handleUpload} disabled={loading}
            className="w-full bg-gradient-to-r from-dark to-brand text-white text-sm font-bold py-3 rounded-xl transition-all disabled:opacity-60 cursor-pointer border-none">
            {loading ? 'Processing your image...' : 'Generate Try-On'}
          </button>
        )}

        {resultImage && (
          <button onClick={handleReset}
            className="w-full bg-dark text-white text-sm font-bold py-3 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer border-none">
            Try Another
          </button>
        )}
      </div>
    </div>
  )
}

export default TryOnModal
