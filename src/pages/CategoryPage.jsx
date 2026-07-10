import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProducts } from '../context/ProductContext'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import './CategoryPage.css'

const CategoryPage = () => {
  const { category } = useParams()
  const { products, loading } = useProducts()
  const { addToCart } = useCart()
  const [wishlist, setWishlist] = useState(new Set())
  const [addedItems, setAddedItems] = useState(new Set())

  const categoryTitle = category
    ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
    : 'All'

  // Filter products by category
  const filtered = category
    ? products.filter(p => p.category?.toLowerCase() === category.toLowerCase())
    : products

  const toggleWishlist = (id) => {
    setWishlist(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      size: product.sizes?.[0] || 'M',
      color: product.colors?.[0] || '',
    })
    setAddedItems(prev => new Set(prev).add(product.id))
    setTimeout(() => {
      setAddedItems(prev => {
        const next = new Set(prev)
        next.delete(product.id)
        return next
      })
    }, 1500)
  }

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [category])

  return (
    <>
      <Navbar />
      <div className="catpage">

        {/* Product Grid */}
        {loading ? (
          <div className="catpage__loading">
            <div className="catpage__spinner" />
            <p>Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="catpage__empty">
            <ShoppingBag size={64} strokeWidth={1} />
            <h2>No products yet</h2>
            <p>Check back soon — new arrivals coming!</p>
            <Link to="/" className="catpage__back-btn">Back to Home</Link>
          </div>
        ) : (
          <div className="catpage__grid">
            {filtered.map(product => {
              const discount = product.comparePrice && product.comparePrice > product.price
                ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                : 0
              const rating = product.rating || 0
              const reviews = product.reviews || 0

              return (
                <div className="catpage__card" key={product.id}>
                  {/* Image */}
                  <Link to={`/product/${product.id}`} className="catpage__card-img-wrap">
                    <img
                      src={product.images?.[0] || ''}
                      alt={product.name}
                      className="catpage__card-img"
                      loading="lazy"
                    />
                    {/* Sale Badge */}
                    {discount > 0 && (
                      <span className="catpage__card-badge catpage__card-badge--sale">
                        {discount}% Off
                      </span>
                    )}
                    {/* Featured Badge */}
                    {product.featured && !discount && (
                      <span className="catpage__card-badge catpage__card-badge--featured">
                        Premium
                      </span>
                    )}
                    {/* Wishlist */}
                    <button
                      className={`catpage__wish ${wishlist.has(product.id) ? 'catpage__wish--active' : ''}`}
                      onClick={(e) => { e.preventDefault(); toggleWishlist(product.id) }}
                    >
                      <Heart size={18} fill={wishlist.has(product.id) ? '#fff' : 'none'} />
                    </button>
                  </Link>

                  {/* Info */}
                  <div className="catpage__card-info">
                    {product.subcategory && (
                      <span className="catpage__card-sub">{product.subcategory}</span>
                    )}
                    <Link to={`/product/${product.id}`} className="catpage__card-name">
                      {product.name}
                    </Link>

                    {/* Price Row */}
                    <div className="catpage__card-price-row">
                      <span className="catpage__card-price">
                        ₹{product.price?.toLocaleString('en-IN')}
                      </span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <>
                          <span className="catpage__card-old">
                            ₹{product.comparePrice.toLocaleString('en-IN')}
                          </span>
                          <span className="catpage__card-discount">
                            {discount}% off
                          </span>
                        </>
                      )}
                    </div>

                    {/* Rating */}
                    {rating > 0 && (
                      <div className="catpage__card-rating">
                        <Star size={13} fill="#c9a96e" stroke="#c9a96e" />
                        <span className="catpage__card-rating-val">{rating}</span>
                        {reviews > 0 && (
                          <span className="catpage__card-rating-count">({reviews.toLocaleString()})</span>
                        )}
                      </div>
                    )}

                    {/* Add to Cart */}
                    <button
                      className={`catpage__add-btn ${addedItems.has(product.id) ? 'catpage__add-btn--added' : ''}`}
                      onClick={() => handleAddToCart(product)}
                    >
                      {addedItems.has(product.id) ? '✓ Added' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
      <CartDrawer />
    </>
  )
}

export default CategoryPage
