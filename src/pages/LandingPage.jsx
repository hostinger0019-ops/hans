import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../context/ProductContext'
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  CreditCard,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  ShoppingBag,
  Heart,
  Eye,
  Timer,
  TrendingUp,
  Sparkles,
  Quote,
  Mail,
  ArrowUpRight
} from 'lucide-react'
import heroBanner from '../assets/images/hero-banner.webp'
import collectionMen from '../assets/images/collection-men.webp'
import collectionWomen from '../assets/images/collection-women.webp'
import ReelsMiniBar from '../components/ReelsMiniBar'
import ReelsViewer from '../components/ReelsViewer'
import { sampleReels } from '../data/reelsData'
import { reelsAPI } from '../services/api'
import QuickViewModal from '../components/QuickViewModal'
import { motion, useScroll, useTransform, useSpring, animate } from 'framer-motion'
import './LandingPage.css'



const testimonials = [
  {
    id: 1,
    name: 'Aisha Khan',
    role: 'Fashion Blogger',
    text: 'Tarik Clothing has completely transformed my wardrobe. The quality is unmatched and every piece feels like luxury. Absolutely love the attention to detail!',
    rating: 5,
    avatar: 'AK',
  },
  {
    id: 2,
    name: 'Rahul Sharma',
    role: 'Entrepreneur',
    text: 'Finally found a brand that combines style with comfort. The leather jacket I ordered is hands down the best purchase I\'ve made this year.',
    rating: 5,
    avatar: 'RS',
  },
  {
    id: 3,
    name: 'Priya Patel',
    role: 'Stylist',
    text: 'As a professional stylist, I\'m very picky about fabrics and cuts. Tarik consistently delivers premium quality that my clients absolutely love.',
    rating: 5,
    avatar: 'PP',
  },
]

/* ─── Intersection Observer Hook ─── */
const useInView = (options = {}) => {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.15, ...options })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return [ref, isInView]
}

/* ─── Countdown Timer ─── */
const useCountdown = (targetHours = 23) => {
  const [time, setTime] = useState({ hours: targetHours, minutes: 59, seconds: 59 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        let { hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) { seconds = 59; minutes-- }
        if (minutes < 0) { minutes = 59; hours-- }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59 }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return time
}

/* ─── Animated Counter ─── */
const Counter = ({ to, suffix = '', decimals = 0, start }) => {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) return
    const controls = animate(0, to, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(v),
    })
    return () => controls.stop()
  }, [start, to])

  return <>{value.toFixed(decimals)}{suffix}</>
}

const LandingPage = () => {
  const { products } = useProducts()
  const trendingProducts = products.slice(0, 8)

  const [heroRef, heroInView] = useInView()
  const [trustRef, trustInView] = useInView()
  const [collectionsRef, collectionsInView] = useInView()
  const [trendingRef, trendingInView] = useInView()
  const [promoRef, promoInView] = useInView()
  const [testimonialsRef, testimonialsInView] = useInView()
  const [newsletterRef, newsletterInView] = useInView()
  const [instagramRef, instagramInView] = useInView()

  const countdown = useCountdown(12)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [hoveredProduct, setHoveredProduct] = useState(null)
  const productScrollRef = useRef(null)
  const [reelsViewerOpen, setReelsViewerOpen] = useState(false)
  const [reelsStartIndex, setReelsStartIndex] = useState(0)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [reelsData, setReelsData] = useState(sampleReels)

  // Fetch reels from backend API
  useEffect(() => {
    reelsAPI.list()
      .then(data => {
        const adminReels = data.reels || []
        if (adminReels.length > 0) {
          setReelsData([...adminReels, ...sampleReels])
        }
      })
      .catch(() => {}) // Keep sample reels on error
  }, [])

  // Scroll-linked animations (parallax + progress bar)
  const { scrollY, scrollYProgress } = useScroll()
  const heroBgY = useTransform(scrollY, [0, 900], [0, 180])
  const heroContentY = useTransform(scrollY, [0, 700], [0, 90])
  const heroContentOpacity = useTransform(scrollY, [0, 550], [1, 0])
  const progressScaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  // Hero entrance choreography
  const heroContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.13, delayChildren: 0.15 } },
  }
  const heroItem = {
    hidden: { y: 44, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } },
  }
  const heroLine = {
    hidden: { y: '112%' },
    show: { y: '0%', transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } },
  }

  const openReelsViewer = (index) => {
    setReelsStartIndex(index)
    setReelsViewerOpen(true)
  }

  const scrollProducts = (direction) => {
    if (productScrollRef.current) {
      const scrollAmount = 320
      productScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const nextTestimonial = () => {
    setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length)
  }

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [currentTestimonial])

  return (
    <>
    <motion.div className="scroll-progress" style={{ scaleX: progressScaleX }} />

    <main className="landing" id="landing-page">

      {/* ═══════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════ */}
      <section
        className={`hero ${heroInView ? 'hero--visible' : ''}`}
        ref={heroRef}
        id="hero-section"
      >
        <div className="hero__bg">
          <motion.img
            src={heroBanner}
            alt="Tarik Clothing Hero"
            className="hero__bg-image"
            style={{ y: heroBgY }}
            fetchpriority="high"
            initial={{ scale: 1.18, filter: 'blur(10px)' }}
            animate={{ scale: 1.05, filter: 'blur(0px)' }}
            transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="hero__bg-overlay"></div>
          <div className="hero__bg-grain"></div>
        </div>

        <motion.div
          className="hero__content container"
          style={{ y: heroContentY, opacity: heroContentOpacity }}
          variants={heroContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div className="hero__badge" variants={heroItem}>
            <Sparkles size={14} />
            <span>New Summer Collection 2026</span>
          </motion.div>
          <h1 className="hero__title">
            <span className="hero__title-mask">
              <motion.span className="hero__title-line" variants={heroLine}>Elevate</motion.span>
            </span>
            <span className="hero__title-mask">
              <motion.span className="hero__title-line hero__title-line--accent" variants={heroLine}>Your Style</motion.span>
            </span>
          </h1>
          <motion.p className="hero__subtitle" variants={heroItem}>
            Discover premium clothing that defines who you are. Handcrafted with passion, designed for the bold.
          </motion.p>
          <motion.div className="hero__cta" variants={heroItem}>
            <motion.a
              href="#collections"
              className="btn btn-primary btn-lg"
              id="hero-shop-btn"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              Shop Collection <ArrowRight size={18} />
            </motion.a>
            <motion.a
              href="/new-arrivals"
              className="btn btn-outline btn-lg"
              id="hero-explore-btn"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore New Arrivals
            </motion.a>
          </motion.div>

          <motion.div className="hero__stats" variants={heroItem}>
            <div className="hero__stat">
              <span className="hero__stat-number"><Counter to={10} suffix="K+" start={true} /></span>
              <span className="hero__stat-label">Happy Customers</span>
            </div>
            <div className="hero__stat-divider"></div>
            <div className="hero__stat">
              <span className="hero__stat-number"><Counter to={500} suffix="+" start={true} /></span>
              <span className="hero__stat-label">Unique Designs</span>
            </div>
            <div className="hero__stat-divider"></div>
            <div className="hero__stat">
              <span className="hero__stat-number"><Counter to={4.9} decimals={1} start={true} /></span>
              <span className="hero__stat-label">Average Rating</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero__scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <span>Scroll to explore</span>
          <div className="hero__scroll-line"></div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          TRUST BAR
          ═══════════════════════════════════════ */}
      <section
        className={`trust-bar ${trustInView ? 'trust-bar--visible' : ''}`}
        ref={trustRef}
        id="trust-bar"
      >
        <div className="trust-bar__container container">
          <div className="trust-bar__item">
            <Truck size={24} />
            <div>
              <span className="trust-bar__title">Free Shipping</span>
              <span className="trust-bar__desc">Orders over ₹999</span>
            </div>
          </div>
          <div className="trust-bar__item">
            <RotateCcw size={24} />
            <div>
              <span className="trust-bar__title">Easy Returns</span>
              <span className="trust-bar__desc">7-day return policy</span>
            </div>
          </div>
          <div className="trust-bar__item">
            <ShieldCheck size={24} />
            <div>
              <span className="trust-bar__title">Secure Checkout</span>
              <span className="trust-bar__desc">100% protected</span>
            </div>
          </div>
          <div className="trust-bar__item">
            <CreditCard size={24} />
            <div>
              <span className="trust-bar__title">COD Available</span>
              <span className="trust-bar__desc">Pay on delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          REELS MINI BAR
          ═══════════════════════════════════════ */}
      <ReelsMiniBar reels={reelsData} onReelClick={openReelsViewer} />

      {/* Reels Full Screen Viewer */}
      {reelsViewerOpen && (
        <ReelsViewer
          reels={reelsData}
          startIndex={reelsStartIndex}
          onClose={() => setReelsViewerOpen(false)}
        />
      )}

      {/* ═══════════════════════════════════════
          COLLECTIONS SECTION
          ═══════════════════════════════════════ */}
      <section
        className={`collections section-padding ${collectionsInView ? 'collections--visible' : ''}`}
        ref={collectionsRef}
        id="collections"
      >
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Curated For You</span>
            <h2 className="section-title">Shop by <span className="text-gradient">Collection</span></h2>
            <p className="section-desc">Explore our carefully curated collections designed for every occasion</p>
          </div>

          <div className="collections__grid">
            <div className="collection-card collection-card--large" id="collection-men">
              <img src={collectionMen} alt="Men's Collection" className="collection-card__image" loading="lazy" />
              <div className="collection-card__overlay">
                <span className="collection-card__tag">New Season</span>
                <h3 className="collection-card__title">Men's Collection</h3>
                <p className="collection-card__desc">Discover bold essentials & streetwear</p>
                <Link to="/collections/men" className="collection-card__link">
                  Explore Now <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>

            <div className="collection-card collection-card--large" id="collection-women">
              <img src={collectionWomen} alt="Women's Collection" className="collection-card__image" loading="lazy" />
              <div className="collection-card__overlay">
                <span className="collection-card__tag">Trending</span>
                <h3 className="collection-card__title">Women's Collection</h3>
                <p className="collection-card__desc">Elegant styles for every moment</p>
                <Link to="/collections/women" className="collection-card__link">
                  Explore Now <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRENDING PRODUCTS
          ═══════════════════════════════════════ */}
      <section
        className={`trending section-padding ${trendingInView ? 'trending--visible' : ''}`}
        ref={trendingRef}
        id="trending"
      >
        <div className="container">
          <div className="section-header">
            <span className="section-tag"><TrendingUp size={14} /> Trending Now</span>
            <h2 className="section-title">New <span className="text-gradient">Arrivals</span></h2>
            <p className="section-desc">The latest drops that everyone is talking about</p>
          </div>

          <div className="trending__controls">
            <div className="trending__tabs">
              <button className="trending__tab trending__tab--active">All</button>
              <button className="trending__tab">Men</button>
              <button className="trending__tab">Women</button>
              <button className="trending__tab">Unisex</button>
            </div>
            <div className="trending__arrows">
              <button className="trending__arrow" onClick={() => scrollProducts('left')} aria-label="Scroll left">
                <ChevronLeft size={20} />
              </button>
              <button className="trending__arrow" onClick={() => scrollProducts('right')} aria-label="Scroll right">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="trending__carousel" ref={productScrollRef}>
            {trendingProducts.map((product, index) => (
              <Link
                to={`/product/${product.id}`}
                key={product.id}
                className="product-card"
                style={{ animationDelay: `${index * 0.1}s`, textDecoration: 'none' }}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                id={`product-card-${product.id}`}
              >
                <div className="product-card__image-wrap">
                  <img src={product.images?.[0] || ''} alt={product.name} className="product-card__image" loading="lazy" />
                  {product.featured && (
                    <span className="product-card__badge product-card__badge--bestseller">
                      Featured
                    </span>
                  )}
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="product-card__discount">
                      -{Math.round((1 - product.price / product.comparePrice) * 100)}%
                    </span>
                  )}

                  <div className={`product-card__actions ${hoveredProduct === product.id ? 'product-card__actions--visible' : ''}`}>
                    <button className="product-card__action" aria-label="Add to wishlist">
                      <Heart size={18} />
                    </button>
                    <button className="product-card__action product-card__action--primary" aria-label="Add to cart">
                      <ShoppingBag size={18} />
                    </button>
                    <button className="product-card__action" aria-label="Quick view" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(product) }}>
                      <Eye size={18} />
                    </button>
                  </div>
                </div>

                <div className="product-card__info">
                  <span className="product-card__category">{product.category}</span>
                  <h3 className="product-card__name">{product.name}</h3>
                  <div className="product-card__rating">
                    <div className="product-card__stars">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < Math.floor(product.rating) ? '#c9a96e' : 'transparent'}
                          stroke={i < Math.floor(product.rating) ? '#c9a96e' : '#666'}
                        />
                      ))}
                    </div>
                    <span className="product-card__review-count">({product.reviews})</span>
                  </div>
                  <div className="product-card__pricing">
                    <span className="product-card__price">₹{product.price.toLocaleString()}</span>
                    {product.comparePrice && (
                      <span className="product-card__original-price">₹{product.comparePrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="trending__view-all">
            <Link to="/shop" className="btn btn-outline" id="view-all-products">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PROMO / SALE BANNER
          ═══════════════════════════════════════ */}
      <section
        className={`promo section-padding ${promoInView ? 'promo--visible' : ''}`}
        ref={promoRef}
        id="promo-section"
      >
        <div className="promo__bg">
          <img
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80"
            alt="Sale background"
            className="promo__bg-image"
          />
          <div className="promo__bg-overlay"></div>
        </div>
        <div className="container promo__content">
          <div className="promo__text">
            <span className="promo__label">Limited Time Offer</span>
            <h2 className="promo__title">Summer Sale <span className="text-gradient">Up to 50% Off</span></h2>
            <p className="promo__desc">Don't miss out on our biggest sale of the season. Premium styles at unbeatable prices.</p>

            <div className="promo__countdown">
              <div className="countdown__item">
                <span className="countdown__number">{String(countdown.hours).padStart(2, '0')}</span>
                <span className="countdown__label">Hours</span>
              </div>
              <span className="countdown__separator">:</span>
              <div className="countdown__item">
                <span className="countdown__number">{String(countdown.minutes).padStart(2, '0')}</span>
                <span className="countdown__label">Minutes</span>
              </div>
              <span className="countdown__separator">:</span>
              <div className="countdown__item">
                <span className="countdown__number">{String(countdown.seconds).padStart(2, '0')}</span>
                <span className="countdown__label">Seconds</span>
              </div>
            </div>

            <Link to="/shop" className="btn btn-primary btn-lg" id="shop-sale-btn">
              Shop the Sale <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════ */}
      <section
        className={`testimonials section-padding ${testimonialsInView ? 'testimonials--visible' : ''}`}
        ref={testimonialsRef}
        id="testimonials"
      >
        <div className="container">
          <div className="section-header">
            <span className="section-tag">What People Say</span>
            <h2 className="section-title">Loved by <span className="text-gradient">Thousands</span></h2>
          </div>

          <div className="testimonials__slider">
            <button className="testimonials__arrow" onClick={prevTestimonial} aria-label="Previous testimonial">
              <ChevronLeft size={20} />
            </button>

            <div className="testimonials__card" key={currentTestimonial}>
              <Quote size={40} className="testimonials__quote-icon" />
              <div className="testimonials__stars">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} size={18} fill="#c9a96e" stroke="#c9a96e" />
                ))}
              </div>
              <p className="testimonials__text">{testimonials[currentTestimonial].text}</p>
              <div className="testimonials__author">
                <div className="testimonials__avatar">{testimonials[currentTestimonial].avatar}</div>
                <div>
                  <span className="testimonials__name">{testimonials[currentTestimonial].name}</span>
                  <span className="testimonials__role">{testimonials[currentTestimonial].role}</span>
                </div>
              </div>
            </div>

            <button className="testimonials__arrow" onClick={nextTestimonial} aria-label="Next testimonial">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="testimonials__dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`testimonials__dot ${i === currentTestimonial ? 'testimonials__dot--active' : ''}`}
                onClick={() => setCurrentTestimonial(i)}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          INSTAGRAM / SOCIAL PROOF
          ═══════════════════════════════════════ */}
      <section
        className={`instagram section-padding ${instagramInView ? 'instagram--visible' : ''}`}
        ref={instagramRef}
        id="instagram-section"
      >
        <div className="container">
          <div className="section-header">
            <span className="section-tag">@tarikclothing</span>
            <h2 className="section-title">Follow Us on <span className="text-gradient">Instagram</span></h2>
            <p className="section-desc">Tag #TarikStyle for a chance to be featured</p>
          </div>
        </div>

        <div className="instagram__grid">
          {[
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
            'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80',
            'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80',
            'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80',
            'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80',
            'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400&q=80',
          ].map((url, i) => (
            <a href="#" className="instagram__item" key={i}>
              <img src={url} alt={`Instagram post ${i + 1}`} loading="lazy" />
              <div className="instagram__overlay">
                <Heart size={24} />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          NEWSLETTER
          ═══════════════════════════════════════ */}
      <section
        className={`newsletter section-padding ${newsletterInView ? 'newsletter--visible' : ''}`}
        ref={newsletterRef}
        id="newsletter-section"
      >
        <div className="container">
          <div className="newsletter__card">
            <div className="newsletter__content">
              <Mail size={40} className="newsletter__icon" />
              <h2 className="newsletter__title">Stay in the <span className="text-gradient">Loop</span></h2>
              <p className="newsletter__desc">
                Subscribe for exclusive drops, early access to sales, and 10% off your first order.
              </p>
              <form className="newsletter__form" onSubmit={(e) => e.preventDefault()} id="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="newsletter__input"
                  id="newsletter-email"
                  required
                />
                <button type="submit" className="btn btn-primary" id="newsletter-submit">
                  Subscribe <ArrowRight size={16} />
                </button>
              </form>
              <p className="newsletter__privacy">No spam, unsubscribe anytime. We respect your privacy.</p>
            </div>
          </div>
        </div>
      </section>

    </main>
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  )
}

export default LandingPage
