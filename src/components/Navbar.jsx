import { useState, useEffect, useContext } from 'react'
import { ShoppingBag, Search, User, Menu, X, Heart } from 'lucide-react'
import CartContext from '../context/CartContext'
import './Navbar.css'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const cartCtx = useContext(CartContext)
  const cartCount = cartCtx?.cartCount || 0
  const setIsCartOpen = cartCtx?.setIsCartOpen || (() => {})

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <div className="announcement-marquee">
          <span>FREE SHIPPING ON ORDERS OVER ₹999 ✦ USE CODE: TARIK10 FOR 10% OFF ✦ NEW ARRIVALS JUST DROPPED ✦ FREE SHIPPING ON ORDERS OVER ₹999 ✦ USE CODE: TARIK10 FOR 10% OFF ✦ NEW ARRIVALS JUST DROPPED ✦&nbsp;</span>
          <span>FREE SHIPPING ON ORDERS OVER ₹999 ✦ USE CODE: TARIK10 FOR 10% OFF ✦ NEW ARRIVALS JUST DROPPED ✦ FREE SHIPPING ON ORDERS OVER ₹999 ✦ USE CODE: TARIK10 FOR 10% OFF ✦ NEW ARRIVALS JUST DROPPED ✦&nbsp;</span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`} id="main-navbar">
        <div className="navbar__container container">
          {/* Mobile Menu Toggle */}
          <button
            className="navbar__mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            id="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <a href="/" className="navbar__logo" id="navbar-logo">
            <span className="navbar__logo-text">TARIK</span>
            <span className="navbar__logo-divider"></span>
            <span className="navbar__logo-sub">CLOTHING</span>
          </a>

          {/* Navigation Links */}
          <ul className="navbar__links" id="navbar-links">
            <li><a href="/" className="navbar__link navbar__link--active">Home</a></li>
            <li><a href="/collections/men" className="navbar__link">Men</a></li>
            <li><a href="/collections/women" className="navbar__link">Women</a></li>
          </ul>

          {/* Action Icons */}
          <div className="navbar__actions" id="navbar-actions">
            <button
              className="navbar__action-btn"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
              id="search-toggle"
            >
              <Search size={20} />
            </button>
            <button className="navbar__action-btn" aria-label="Wishlist" id="wishlist-btn">
              <Heart size={20} />
              <span className="navbar__badge">0</span>
            </button>
            <button className="navbar__action-btn" aria-label="Account" id="account-btn">
              <User size={20} />
            </button>
            <button className="navbar__action-btn navbar__cart-btn" aria-label="Cart" id="cart-btn" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="navbar__badge">{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* Search Overlay */}
        <div className={`navbar__search-overlay ${isSearchOpen ? 'navbar__search-overlay--open' : ''}`}>
          <div className="navbar__search-container container">
            <Search size={20} className="navbar__search-icon" />
            <input
              type="text"
              placeholder="Search for products..."
              className="navbar__search-input"
              id="search-input"
              autoFocus={isSearchOpen}
            />
            <button
              className="navbar__search-close"
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu--open' : ''}`} id="mobile-menu">
        <div className="mobile-menu__overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="mobile-menu__drawer">
          <div className="mobile-menu__header">
            <span className="mobile-menu__title">Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
              <X size={22} />
            </button>
          </div>
          <ul className="mobile-menu__links">
            <li><a href="/" className="mobile-menu__link" onClick={() => setIsMobileMenuOpen(false)}>Home</a></li>
            <li><a href="/collections/men" className="mobile-menu__link" onClick={() => setIsMobileMenuOpen(false)}>Men</a></li>
            <li><a href="/collections/women" className="mobile-menu__link" onClick={() => setIsMobileMenuOpen(false)}>Women</a></li>
          </ul>
          <div className="mobile-menu__footer">
            <a href="#" className="mobile-menu__footer-link"><User size={18} /> My Account</a>
            <a href="#" className="mobile-menu__footer-link"><Heart size={18} /> Wishlist</a>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
