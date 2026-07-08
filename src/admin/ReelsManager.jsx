import { useState, useRef, useEffect } from 'react'
import { Film, Plus, Upload, X, Play, Trash2, Link } from 'lucide-react'
import { uploadAPI, reelsAPI } from '../services/api'
import { useProducts } from '../context/ProductContext'
import './ReelsManager.css'

const ReelsManager = () => {
  const videoInputRef = useRef(null)
  const { products } = useProducts()
  const [reels, setReels] = useState([])
  const [showUpload, setShowUpload] = useState(false)
  const [newReel, setNewReel] = useState({ caption: '', productId: '', video: null, videoUrl: '' })
  const [uploading, setUploading] = useState(false)

  // Fetch reels from backend on mount
  useEffect(() => {
    reelsAPI.list()
      .then(data => setReels(data.reels || []))
      .catch(err => console.error('Failed to load reels:', err))
  }, [])

  const handleVideoSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('video/')) {
      setNewReel(prev => ({
        ...prev,
        video: file,
        videoUrl: URL.createObjectURL(file),
      }))
    }
  }

  const handleSaveReel = async () => {
    if (!newReel.video || !newReel.caption) return
    setUploading(true)
    try {
      // Find the selected product
      const selectedProduct = products.find(p => String(p.id) === String(newReel.productId))

      // Upload video to Hostinger
      const result = await uploadAPI.upload(newReel.video)

      // Save reel to backend database
      await reelsAPI.create({
        video_url: result.url,
        caption: newReel.caption,
        product_id: selectedProduct?.id || null,
        product_name: selectedProduct?.name || '',
        product_price: selectedProduct?.price || 0,
      })

      // Refresh reels list
      const data = await reelsAPI.list()
      setReels(data.reels || [])

      setNewReel({ caption: '', productId: '', video: null, videoUrl: '' })
      setShowUpload(false)
    } catch (err) {
      alert('Failed to upload video: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const deleteReel = async (id) => {
    try {
      await reelsAPI.delete(id)
      setReels(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      alert('Failed to delete reel: ' + err.message)
    }
  }

  return (
    <div className="reels-manager" id="admin-reels">
      <div className="reels-manager__header">
        <div>
          <h1 className="reels-manager__title">Reels Manager</h1>
          <p className="reels-manager__subtitle">Upload and manage your product reels</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUpload(true)} id="upload-reel-btn">
          <Plus size={18} /> Upload Reel
        </button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="reels-manager__modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="reels-manager__modal" onClick={e => e.stopPropagation()}>
            <div className="reels-manager__modal-header">
              <h2>Upload New Reel</h2>
              <button onClick={() => setShowUpload(false)}><X size={20} /></button>
            </div>

            <div className="reels-manager__modal-body">
              {/* Video Upload */}
              {!newReel.videoUrl ? (
                <div className="reels-manager__dropzone" onClick={() => videoInputRef.current?.click()}>
                  <Upload size={36} />
                  <p><strong>Click to upload video</strong></p>
                  <span>MP4, MOV up to 100MB</span>
                  <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelect} style={{ display: 'none' }} />
                </div>
              ) : (
                <div className="reels-manager__video-preview">
                  <video src={newReel.videoUrl} controls muted className="reels-manager__video" />
                  <button className="reels-manager__video-change" onClick={() => setNewReel(prev => ({ ...prev, video: null, videoUrl: '' }))}>
                    Change Video
                  </button>
                </div>
              )}

              <div className="reels-manager__form-field">
                <label>Caption *</label>
                <textarea
                  value={newReel.caption}
                  onChange={(e) => setNewReel(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Write a caption for your reel..."
                  rows={3}
                />
              </div>

              <div className="reels-manager__form-field">
                <label>Link to Product *</label>
                <select
                  value={newReel.productId}
                  onChange={(e) => setNewReel(prev => ({ ...prev, productId: e.target.value }))}
                  className="reels-manager__product-select"
                >
                  <option value="">— Select a product —</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} — ₹{product.price?.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="reels-manager__modal-footer">
              <button className="btn btn-outline" onClick={() => setShowUpload(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveReel} disabled={!newReel.video || !newReel.caption || uploading}>
                {uploading ? 'Uploading...' : <><Upload size={16} /> Publish Reel</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reels Grid */}
      {reels.length === 0 ? (
        <div className="reels-manager__empty">
          <Film size={64} />
          <h3>No Reels Yet</h3>
          <p>Upload your first product reel to showcase on the storefront</p>
          <button className="btn btn-outline" onClick={() => setShowUpload(true)}>
            <Plus size={16} /> Upload First Reel
          </button>
        </div>
      ) : (
        <div className="reels-manager__grid">
          {reels.map(reel => (
            <div className="reels-manager__card" key={reel.id}>
              <div className="reels-manager__card-video">
                <video src={reel.videoUrl} muted className="reels-manager__card-thumb" />
                <div className="reels-manager__card-play"><Play size={24} fill="white" /></div>
              </div>
              <div className="reels-manager__card-info">
                <p className="reels-manager__card-caption">{reel.caption}</p>
                {reel.productName && (
                  <div className="reels-manager__card-product">
                    <Link size={12} />
                    <span>{reel.productName} — ₹{reel.productPrice}</span>
                  </div>
                )}
                <span className="reels-manager__card-date">{reel.createdAt}</span>
              </div>
              <button className="reels-manager__card-delete" onClick={() => deleteReel(reel.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReelsManager
