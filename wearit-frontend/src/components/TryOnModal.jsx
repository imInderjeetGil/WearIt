import React, { useState } from 'react';
import API_BASE from '../config';

function TryOnModal({ isOpen, onClose, productId, productName }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResultImage(null); // Purana result clear karo
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Pehle apni ek photo select karo bhai!");
    
    setLoading(true);
    const formData = new FormData();
    formData.append("user_image", file);

    try {
      const response = await fetch(`${API_BASE}/ai/tryon?product_id=${productId}`, {
        method: "POST",
        body: formData, // FormData ke sath content-type header nahi dete, browser khud set karta hai
      });
      
      const data = await response.json();
      if (data.success) {
        setResultImage(data.processed_image_url);
      } else {
        alert("Try-On fail ho gaya, dobara check karo.");
      }
    } catch (err) {
      console.error("Tryon error:", err);
      alert("Backend se connect nahi ho paya!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', maxWidth: '550px', width: '100%', position: 'relative', textAlign: 'center', fontFamily: 'sans-serif' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        
        <h3 style={{ margin: '0 0 10px 0', color: '#1a1a2e' }}>✨ AI Virtual Try-On</h3>
        <p style={{ fontSize: '14px', color: '#7e7e7e', marginBottom: '20px' }}>See how <b>{productName}</b> looks on you instantly!</p>

        {/* Image Containers */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
          {/* User Image Preview */}
          {preview && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Your Photo</div>
              <img src={preview} alt="User preview" style={{ width: '140px', height: '180px', objectFit: 'cover', borderRadius: '8px', border: '2px dashed #ebebeb' }} />
            </div>
          )}

          {/* AI Output Image */}
          {resultImage && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f43f5e', marginBottom: '4px' }}>Magic Try-On 🔥</div>
              <img src={resultImage} alt="AI Result" style={{ width: '140px', height: '180px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #f43f5e' }} />
            </div>
          )}
        </div>

        {/* Controls */}
        {!resultImage && (
          <div style={{ marginBottom: '20px' }}>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} id="hidden-file-input" />
            <label htmlFor="hidden-file-input" style={{ background: '#fff0f3', color: '#f43f5e', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'inline-block', border: '1px solid #ffe4e6' }}>
              {preview ? "Change Photo 📸" : "Upload Your Photo 📸"}
            </label>
          </div>
        )}

        {/* Action Button */}
        {preview && !resultImage && (
          <button onClick={handleUpload} disabled={loading} style={{ width: '100%', background: 'linear-gradient(120deg, #1a1a2e, #f43f5e)', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
            {loading ? "AI is rendering your outfit... 🧠✨" : "Generate Try-On Image 🪄"}
          </button>
        )}

        {resultImage && (
          <button onClick={() => { setFile(null); setPreview(null); setResultImage(null); }} style={{ width: '100%', background: '#1a1a2e', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
            Try Another One 🔄
          </button>
        )}
      </div>
    </div>
  );
}

export default TryOnModal;