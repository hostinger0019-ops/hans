import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProducts } from '../context/ProductContext'
import { uploadAPI } from '../services/api'
import {
  Upload,
  X,
  Image,
  Film,
  Plus,
  Save,
  Eye,
  ArrowLeft,
  GripVertical,
} from 'lucide-react'
import './AddProduct.css'

const AddProduct = () => {
  const navigate = useNavigate()
  const { addProduct } = useProducts()
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    category: 'Men',
    subcategory: '',
    sizes: [],
    colors: [],
    stock: '',
    status: 'published',
    featured: false,
  })

  const [images, setImages] = useState([])
  const [videos, setVideos] = useState([])
  const [newColor, setNewColor] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38']
  const categories = ['Men', 'Women', 'Unisex']
  const subcategories = ['T-Shirts', 'Shirts', 'Jackets', 'Blazers', 'Pants', 'Jeans', 'Dresses', 'Skirts', 'Hoodies', 'Sweaters', 'Shorts', 'Accessories']

  /* ─── Handlers ─── */
  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }))
  }

  const toggleSize = (size) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }))
  }

  const addColor = () => {
    if (newColor.trim() && !form.colors.includes(newColor.trim())) {
      setForm(prev => ({ ...prev, colors: [...prev.colors, newColor.trim()] }))
      setNewColor('')
    }
  }

  const removeColor = (color) => {
    setForm(prev => ({ ...prev, colors: prev.colors.filter(c => c !== color) }))
  }

  /* ─── Image Upload ─── */
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    processImageFiles(files)
  }

  const processImageFiles = (files) => {
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: e.target.result,
          name: file.name,
          size: file.size,
          file: file,  // Keep original file for backend upload
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  /* ─── Video Upload ─── */
  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      if (!file.type.startsWith('video/')) return
      const url = URL.createObjectURL(file)
      setVideos(prev => [...prev, {
        id: Date.now() + Math.random(),
        url,
        name: file.name,
        size: file.size,
      }])
    })
  }

  const removeVideo = (id) => {
    setVideos(prev => prev.filter(v => v.id !== id))
  }

  /* ─── Drag & Drop ─── */
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(f => f.type.startsWith('image/'))
    const videoFiles = files.filter(f => f.type.startsWith('video/'))
    if (imageFiles.length) processImageFiles(imageFiles)
    if (videoFiles.length) {
      videoFiles.forEach(file => {
        const url = URL.createObjectURL(file)
        setVideos(prev => [...prev, { id: Date.now() + Math.random(), url, name: file.name, size: file.size }])
      })
    }
  }

  /* ─── Validate ─── */
  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Product name is required'
    if (!form.price || parseFloat(form.price) <= 0) errs.price = 'Valid price is required'
    if (form.stock === '' || parseInt(form.stock) < 0) errs.stock = 'Stock quantity is required'
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      alert('Please fill in: ' + Object.values(errs).join(', '))
    }
    return Object.keys(errs).length === 0
  }

  /* ─── Submit ─── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      // Upload images to backend
      const imageUrls = []
      for (const img of images) {
        if (img.file) {
          try {
            const result = await uploadAPI.upload(img.file)
            imageUrls.push(result.url)
          } catch {
            // Fallback to base64 if upload fails
            imageUrls.push(img.url)
          }
        } else {
          imageUrls.push(img.url)
        }
      }

      await addProduct({
        ...form,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        stock: parseInt(form.stock),
        images: imageUrls,
        videos: videos.map(v => v.url),
      })
      setSaving(false)
      navigate('/admin/products')
    } catch (err) {
      console.error('Failed to save product:', err)
      alert('Failed to save product: ' + (err.message || 'Unknown error'))
      setSaving(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  return (
    <div className="add-product" id="add-product-page">
      <div className="add-product__header">
        <button className="add-product__back" onClick={() => navigate('/admin/products')}>
          <ArrowLeft size={20} /> Back
        </button>
        <h1 className="add-product__title">Add New Product</h1>
      </div>

      <form className="add-product__form" onSubmit={handleSubmit}>
        <div className="add-product__grid">
          {/* Left Column — Main Info */}
          <div className="add-product__left">
            {/* Media Upload */}
            <div className="add-product__card">
              <h2 className="add-product__card-title">
                <Image size={20} /> Product Media
              </h2>

              {/* Drag & Drop Zone */}
              <div
                className={`add-product__dropzone ${dragActive ? 'add-product__dropzone--active' : ''} ${errors.images ? 'add-product__dropzone--error' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => imageInputRef.current?.click()}
                id="image-dropzone"
              >
                <Upload size={36} />
                <p className="add-product__dropzone-text">
                  <strong>Drop images & videos here</strong>
                  <br />or click to browse
                </p>
                <span className="add-product__dropzone-hint">PNG, JPG, WEBP, MP4, MOV up to 50MB</span>
                <input
                  ref={imageInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="add-product__file-input"
                  id="image-upload-input"
                />
              </div>
              {errors.images && <span className="add-product__error">{errors.images}</span>}

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="add-product__preview-grid">
                  {images.map((img, i) => (
                    <div className={`add-product__preview-item ${i === 0 ? 'add-product__preview-item--primary' : ''}`} key={img.id}>
                      <img src={img.url} alt={img.name} />
                      {i === 0 && <span className="add-product__preview-badge">Main</span>}
                      <button type="button" className="add-product__preview-remove" onClick={() => removeImage(img.id)}>
                        <X size={14} />
                      </button>
                      <span className="add-product__preview-size">{formatFileSize(img.size)}</span>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-product__preview-add"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Plus size={24} />
                    <span>Add More</span>
                  </button>
                </div>
              )}

              {/* Video Upload */}
              <div className="add-product__video-section">
                <div className="add-product__video-header">
                  <h3><Film size={16} /> Product Videos</h3>
                  <button type="button" className="add-product__video-btn" onClick={() => videoInputRef.current?.click()}>
                    <Plus size={16} /> Add Video
                  </button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleVideoSelect}
                    className="add-product__file-input"
                    id="video-upload-input"
                  />
                </div>

                {videos.length > 0 && (
                  <div className="add-product__video-list">
                    {videos.map(video => (
                      <div className="add-product__video-item" key={video.id}>
                        <video src={video.url} className="add-product__video-preview" muted />
                        <div className="add-product__video-info">
                          <span className="add-product__video-name">{video.name}</span>
                          <span className="add-product__video-size">{formatFileSize(video.size)}</span>
                        </div>
                        <button type="button" className="add-product__video-remove" onClick={() => removeVideo(video.id)}>
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="add-product__card">
              <h2 className="add-product__card-title">Product Information</h2>

              <div className="add-product__field">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder="e.g. Premium Leather Jacket"
                  className={`add-product__input ${errors.name ? 'add-product__input--error' : ''}`}
                  id="product-name-input"
                />
                {errors.name && <span className="add-product__error">{errors.name}</span>}
              </div>

              <div className="add-product__field">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  placeholder="Write a compelling product description..."
                  className="add-product__textarea"
                  rows={5}
                  id="product-description"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="add-product__card">
              <h2 className="add-product__card-title">Pricing</h2>
              <div className="add-product__row">
                <div className="add-product__field">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => updateForm('price', e.target.value)}
                    placeholder="0.00"
                    className={`add-product__input ${errors.price ? 'add-product__input--error' : ''}`}
                    id="product-price"
                  />
                  {errors.price && <span className="add-product__error">{errors.price}</span>}
                </div>
                <div className="add-product__field">
                  <label>Compare-at Price (₹)</label>
                  <input
                    type="number"
                    value={form.comparePrice}
                    onChange={(e) => updateForm('comparePrice', e.target.value)}
                    placeholder="0.00"
                    className="add-product__input"
                    id="product-compare-price"
                  />
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="add-product__card">
              <h2 className="add-product__card-title">Variants</h2>

              <div className="add-product__field">
                <label>Sizes</label>
                <div className="add-product__sizes">
                  {allSizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      className={`add-product__size-btn ${form.sizes.includes(size) ? 'add-product__size-btn--active' : ''}`}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="add-product__field">
                <label>Colors</label>
                <div className="add-product__colors">
                  {form.colors.map(color => (
                    <span className="add-product__color-tag" key={color}>
                      {color}
                      <button type="button" onClick={() => removeColor(color)}><X size={12} /></button>
                    </span>
                  ))}
                  <div className="add-product__color-input-wrap">
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                      placeholder="Add color"
                      className="add-product__color-input"
                    />
                    <button type="button" className="add-product__color-add" onClick={addColor}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Meta */}
          <div className="add-product__right">
            {/* Status */}
            <div className="add-product__card">
              <h2 className="add-product__card-title">Status</h2>
              <div className="add-product__field">
                <select
                  value={form.status}
                  onChange={(e) => updateForm('status', e.target.value)}
                  className="add-product__input"
                  id="product-status"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <label className="add-product__checkbox">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => updateForm('featured', e.target.checked)}
                />
                <span>Featured Product</span>
              </label>
            </div>

            {/* Category */}
            <div className="add-product__card">
              <h2 className="add-product__card-title">Organization</h2>
              <div className="add-product__field">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => updateForm('category', e.target.value)}
                  className="add-product__input"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="add-product__field">
                <label>Subcategory</label>
                <select
                  value={form.subcategory}
                  onChange={(e) => updateForm('subcategory', e.target.value)}
                  className="add-product__input"
                >
                  <option value="">Select subcategory</option>
                  {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Inventory */}
            <div className="add-product__card">
              <h2 className="add-product__card-title">Inventory</h2>
              <div className="add-product__field">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => updateForm('stock', e.target.value)}
                  placeholder="0"
                  className={`add-product__input ${errors.stock ? 'add-product__input--error' : ''}`}
                  id="product-stock"
                />
                {errors.stock && <span className="add-product__error">{errors.stock}</span>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="add-product__actions">
              <button type="submit" className={`btn btn-primary btn-lg add-product__submit ${saving ? 'add-product__submit--saving' : ''}`} disabled={saving} id="save-product-btn">
                {saving ? <span className="add-product__spinner"></span> : <><Save size={18} /> Save Product</>}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/products')}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddProduct
