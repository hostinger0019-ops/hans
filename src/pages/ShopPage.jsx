import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../context/ProductContext'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import QuickViewModal from '../components/QuickViewModal'
import {
  Search, SlidersHorizontal, X, ChevronDown, ChevronUp,
  Grid3X3, List, Star, Heart, ShoppingBag, Eye, ArrowUpDown,
  Check, Filter, ArrowRight, Package,
} from 'lucide-react'
import './ShopPage.css'

const ShopPage = () => {
  const { products } = useProducts()
  const { addToCart } = useCart()

  /* ─── Filter State ─── */
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    size: true,
    color: true,
    rating: false,
  })
  const [hoveredProduct, setHoveredProduct] = useState(null)
  const [wishlist, setWishlist] = useState(new Set())
  const [addedProducts, setAddedProducts] = useState(new Set())
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  const productsPerPage = 9

  /* ─── Derived Filter Options ─── */
  const allCategories = [...new Set(products.map(p => p.category))]
  const allSizes = [...new Set(products.flatMap(p => p.sizes || []))]
  const allColors = [...new Set(products.flatMap(p => p.colors || []))]
  const maxPrice = Math.max(...products.map(p => p.price), 10000)

  /* ─── Filtered Products ─── */
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.status === 'published')

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    }

    // Category
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category))
    }

    // Size
    if (selectedSizes.length > 0) {
      result = result.filter(p => p.sizes?.some(s => selectedSizes.includes(s)))
    }

    // Color
    if (selectedColors.length > 0) {
      result = result.filter(p => p.colors?.some(c => selectedColors.includes(c)))
    }

    // Price
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Rating
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating)
    }

    // Sort
    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break
      case 'price-desc': result.sort((a, b) => b.price - a.price); break
      case 'newest': result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break
      case 'rating': result.sort((a, b) => b.rating - a.rating); break
      case 'popular': result.sort((a, b) => b.reviews - a.reviews); break
      default: result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break
    }

    return result
  }, [products, searchQuery, selectedCategories, selectedSizes, selectedColors, priceRange, minRating, sortBy])

  /* ─── Pagination ─── */
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  )

  useEffect(() => { setCurrentPage(1) }, [searchQuery, selectedCategories, selectedSizes, selectedColors, priceRange, minRating, sortBy])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [currentPage])

  /* ─── Handlers ─── */
  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    )
  }

  const toggleColor = (color) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    )
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setSelectedSizes([])
    setSelectedColors([])
    setPriceRange([0, maxPrice])
    setMinRating(0)
    setSortBy('featured')
  }

  const activeFilterCount = selectedCategories.length + selectedSizes.length + selectedColors.length + (minRating > 0 ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0)

  const toggleWishlist = (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    setWishlist(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleQuickAdd = (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, product.sizes?.[0] || '', product.colors?.[0] || '', 1)
    setAddedProducts(prev => new Set(prev).add(product.id))
    setTimeout(() => setAddedProducts(prev => {
      const next = new Set(prev)
      next.delete(product.id)
      return next
    }), 1500)
  }

  /* ─── Active Filter Tags ─── */
  const activeFilters = [
    ...selectedCategories.map(c => ({ label: c, type: 'category', value: c })),
    ...selectedSizes.map(s => ({ label: `Size: ${s}`, type: 'size', value: s })),
    ...selectedColors.map(c => ({ label: c, type: 'color', value: c })),
    ...(minRating > 0 ? [{ label: `${minRating}+ Stars`, type: 'rating', value: minRating }] : []),
    ...(priceRange[0] > 0 || priceRange[1] < maxPrice ? [{ label: `₹${priceRange[0]} - ₹${priceRange[1]}`, type: 'price', value: null }] : []),
  ]

  const removeFilter = (filter) => {
    switch (filter.type) {
      case 'category': toggleCategory(filter.value); break
      case 'size': toggleSize(filter.value); break
      case 'color': toggleColor(filter.value); break
      case 'rating': setMinRating(0); break
      case 'price': setPriceRange([0, maxPrice]); break
    }
  }

  /* ─── Filter Sidebar Content ─── */
  const FilterContent = () => (
    <div className="shop__filters-inner">
      {/* Search within filters */}
      <div className="shop__filter-search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="shop__filter-search-input"
        />
        {searchQuery && (
          <button className="shop__filter-search-clear" onClick={() => setSearchQuery('')}><X size={14} /></button>
        )}
      </div>

      {/* Category */}
      <div className="shop__filter-section">
        <button className="shop__filter-heading" onClick={() => toggleSection('category')}>
          <span>Category</span>
          {expandedSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.category && (
          <div className="shop__filter-options">
            {allCategories.map(cat => (
              <label className="shop__filter-checkbox" key={cat}>
                <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} />
                <span className="shop__filter-checkmark"><Check size={12} /></span>
                <span>{cat}</span>
                <span className="shop__filter-count">
                  {products.filter(p => p.category === cat && p.status === 'published').length}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="shop__filter-section">
        <button className="shop__filter-heading" onClick={() => toggleSection('price')}>
          <span>Price Range</span>
          {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.price && (
          <div className="shop__filter-options">
            <div className="shop__price-range">
              <div className="shop__price-inputs">
                <div className="shop__price-input-wrap">
                  <span>₹</span>
                  <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])} min={0} max={priceRange[1]} />
                </div>
                <span className="shop__price-separator">to</span>
                <div className="shop__price-input-wrap">
                  <span>₹</span>
                  <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], +e.target.value])} min={priceRange[0]} max={maxPrice} />
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                className="shop__price-slider"
              />
            </div>
            <div className="shop__price-presets">
              {[
                [0, 1500, 'Under ₹1,500'],
                [1500, 3000, '₹1,500 - ₹3,000'],
                [3000, 5000, '₹3,000 - ₹5,000'],
                [5000, maxPrice, 'Above ₹5,000'],
              ].map(([min, max, label]) => (
                <button key={label} className={`shop__price-preset ${priceRange[0] === min && priceRange[1] === max ? 'shop__price-preset--active' : ''}`} onClick={() => setPriceRange([min, max])}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sizes */}
      <div className="shop__filter-section">
        <button className="shop__filter-heading" onClick={() => toggleSection('size')}>
          <span>Size</span>
          {expandedSections.size ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.size && (
          <div className="shop__filter-options">
            <div className="shop__size-grid">
              {allSizes.map(size => (
                <button
                  key={size}
                  className={`shop__size-btn ${selectedSizes.includes(size) ? 'shop__size-btn--active' : ''}`}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="shop__filter-section">
        <button className="shop__filter-heading" onClick={() => toggleSection('color')}>
          <span>Color</span>
          {expandedSections.color ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.color && (
          <div className="shop__filter-options">
            <div className="shop__color-list">
              {allColors.map(color => (
                <button
                  key={color}
                  className={`shop__color-btn ${selectedColors.includes(color) ? 'shop__color-btn--active' : ''}`}
                  onClick={() => toggleColor(color)}
                >
                  <span className="shop__color-swatch" style={{ background: color.toLowerCase() }}></span>
                  <span>{color}</span>
                  {selectedColors.includes(color) && <Check size={12} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="shop__filter-section">
        <button className="shop__filter-heading" onClick={() => toggleSection('rating')}>
          <span>Rating</span>
          {expandedSections.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.rating && (
          <div className="shop__filter-options">
            {[4, 3, 2, 1].map(rating => (
              <button
                key={rating}
                className={`shop__rating-btn ${minRating === rating ? 'shop__rating-btn--active' : ''}`}
                onClick={() => setMinRating(minRating === rating ? 0 : rating)}
              >
                <div className="shop__rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < rating ? '#c9a96e' : 'transparent'} stroke={i < rating ? '#c9a96e' : '#444'} />
                  ))}
                </div>
                <span>& Up</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clear All */}
      {activeFilterCount > 0 && (
        <button className="shop__clear-filters" onClick={clearAllFilters}>
          <X size={14} /> Clear All Filters
        </button>
      )}
    </div>
  )

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="shop" id="shop-page">

        <div className="container shop__layout">
          {/* Mobile Filter Toggle */}
          <button className="shop__mobile-filter-btn" onClick={() => setMobileFiltersOpen(true)}>
            <SlidersHorizontal size={18} />
            Filters
            {activeFilterCount > 0 && <span className="shop__mobile-filter-count">{activeFilterCount}</span>}
          </button>

          {/* Mobile Filter Drawer */}
          {mobileFiltersOpen && (
            <div className="shop__mobile-overlay">
              <div className="shop__mobile-backdrop" onClick={() => setMobileFiltersOpen(false)}></div>
              <div className="shop__mobile-drawer">
                <div className="shop__mobile-drawer-header">
                  <h3><Filter size={18} /> Filters</h3>
                  <button onClick={() => setMobileFiltersOpen(false)}><X size={22} /></button>
                </div>
                <FilterContent />
                <div className="shop__mobile-drawer-footer">
                  <button className="btn btn-primary" onClick={() => setMobileFiltersOpen(false)}>
                    Show {filteredProducts.length} Results
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <aside className="shop__sidebar">
            <div className="shop__sidebar-header">
              <h3><SlidersHorizontal size={18} /> Filters</h3>
              {activeFilterCount > 0 && (
                <span className="shop__filter-badge">{activeFilterCount}</span>
              )}
            </div>
            <FilterContent />
          </aside>

          {/* Products Area */}
          <div className="shop__products">
            {/* Toolbar */}
            <div className="shop__toolbar">
              <div className="shop__toolbar-left">
                <span className="shop__result-count">
                  Showing <strong>{paginatedProducts.length}</strong> of <strong>{filteredProducts.length}</strong> products
                </span>
              </div>
              <div className="shop__toolbar-right">
                <div className="shop__sort">
                  <ArrowUpDown size={14} />
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="shop__sort-select">
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="price-desc">Price: High → Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
                <div className="shop__view-toggle">
                  <button className={`shop__view-btn ${viewMode === 'grid' ? 'shop__view-btn--active' : ''}`} onClick={() => setViewMode('grid')} aria-label="Grid view">
                    <Grid3X3 size={18} />
                  </button>
                  <button className={`shop__view-btn ${viewMode === 'list' ? 'shop__view-btn--active' : ''}`} onClick={() => setViewMode('list')} aria-label="List view">
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Tags */}
            {activeFilters.length > 0 && (
              <div className="shop__active-filters">
                {activeFilters.map((filter, i) => (
                  <span className="shop__active-tag" key={i}>
                    {filter.label}
                    <button onClick={() => removeFilter(filter)}><X size={12} /></button>
                  </span>
                ))}
                <button className="shop__clear-all-tags" onClick={clearAllFilters}>Clear All</button>
              </div>
            )}

            {/* Product Grid */}
            {paginatedProducts.length === 0 ? (
              <div className="shop__empty">
                <Package size={56} />
                <h3>No products found</h3>
                <p>Try adjusting your filters or search query</p>
                <button className="btn btn-outline" onClick={clearAllFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className={`shop__grid shop__grid--${viewMode}`}>
                {paginatedProducts.map((product, index) => (
                  <Link
                    to={`/product/${product.id}`}
                    key={product.id}
                    className={`shop-card ${viewMode === 'list' ? 'shop-card--list' : ''}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    {/* Image */}
                    <div className="shop-card__img-wrap">
                      <img src={product.images[0]} alt={product.name} className="shop-card__img" loading="lazy" />
                      {product.featured && <span className="shop-card__badge">Featured</span>}
                      {product.comparePrice && (
                        <span className="shop-card__discount">
                          -{Math.round((1 - product.price / product.comparePrice) * 100)}%
                        </span>
                      )}

                      {/* Hover Actions */}
                      <div className={`shop-card__overlay ${hoveredProduct === product.id ? 'shop-card__overlay--visible' : ''}`}>
                        <button className={`shop-card__action ${wishlist.has(product.id) ? 'shop-card__action--liked' : ''}`} onClick={(e) => toggleWishlist(product.id, e)} aria-label="Wishlist">
                          <Heart size={18} fill={wishlist.has(product.id) ? '#e74c3c' : 'none'} stroke={wishlist.has(product.id) ? '#e74c3c' : 'currentColor'} />
                        </button>
                        <button
                          className={`shop-card__action shop-card__action--cart ${addedProducts.has(product.id) ? 'shop-card__action--added' : ''}`}
                          onClick={(e) => handleQuickAdd(product, e)}
                          aria-label="Add to cart"
                        >
                          {addedProducts.has(product.id) ? <Check size={18} /> : <ShoppingBag size={18} />}
                        </button>
                        <button className="shop-card__action" aria-label="Quick view" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(product) }}>
                          <Eye size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="shop-card__info">
                      <span className="shop-card__category">{product.category}</span>
                      <h3 className="shop-card__name">{product.name}</h3>

                      {viewMode === 'list' && (
                        <p className="shop-card__desc">{product.description}</p>
                      )}

                      <div className="shop-card__rating">
                        <div className="shop-card__stars">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < Math.floor(product.rating) ? '#c9a96e' : 'transparent'} stroke={i < Math.floor(product.rating) ? '#c9a96e' : '#555'} />
                          ))}
                        </div>
                        <span className="shop-card__review-count">({product.reviews})</span>
                      </div>

                      <div className="shop-card__pricing">
                        <span className="shop-card__price">₹{product.price.toLocaleString()}</span>
                        {product.comparePrice && (
                          <span className="shop-card__compare">₹{product.comparePrice.toLocaleString()}</span>
                        )}
                      </div>

                      {viewMode === 'list' && (
                        <div className="shop-card__list-meta">
                          {product.sizes?.length > 0 && (
                            <span className="shop-card__sizes-tag">
                              Sizes: {product.sizes.join(', ')}
                            </span>
                          )}
                          {product.stock < 20 && <span className="shop-card__stock-alert">🔥 Only {product.stock} left</span>}
                        </div>
                      )}

                      {viewMode === 'list' && (
                        <span className="shop-card__list-cta">
                          View Product <ArrowRight size={14} />
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="shop__pagination">
                <button
                  className="shop__page-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`shop__page-num ${currentPage === i + 1 ? 'shop__page-num--active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="shop__page-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  )
}

export default ShopPage
