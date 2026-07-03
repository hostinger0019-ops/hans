import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react'
import './Footer.css'

/* Custom SVG Social Icons (brand icons removed from lucide-react) */
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
)

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
)

const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        {/* Footer Main Grid */}
        <div className="footer__grid">
          {/* Brand Column */}
          <div className="footer__brand">
            <a href="/" className="footer__logo">
              <span className="footer__logo-text">TARIK</span>
              <span className="footer__logo-divider"></span>
              <span className="footer__logo-sub">CLOTHING</span>
            </a>
            <p className="footer__brand-desc">
              Premium streetwear and luxury fashion designed for those who dare to stand out. Crafted with passion, worn with pride.
            </p>
            <div className="footer__socials">
              <a href="#" className="footer__social" aria-label="Instagram"><InstagramIcon /></a>
              <a href="#" className="footer__social" aria-label="Facebook"><FacebookIcon /></a>
              <a href="#" className="footer__social" aria-label="Twitter"><TwitterIcon /></a>
              <a href="#" className="footer__social" aria-label="YouTube"><YoutubeIcon /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__column">
            <h4 className="footer__column-title">Quick Links</h4>
            <ul className="footer__links">
              <li><a href="#">New Arrivals <ArrowUpRight size={12} /></a></li>
              <li><a href="#">Men's Collection</a></li>
              <li><a href="#">Women's Collection</a></li>
              <li><a href="#">Accessories</a></li>
              <li><a href="#" className="footer__link--sale">Sale</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer__column">
            <h4 className="footer__column-title">Customer Service</h4>
            <ul className="footer__links">
              <li><a href="#">Track Order</a></li>
              <li><a href="#">Shipping Policy</a></li>
              <li><a href="#">Returns & Exchanges</a></li>
              <li><a href="#">Size Guide</a></li>
              <li><a href="#">FAQs</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer__column">
            <h4 className="footer__column-title">Contact Us</h4>
            <ul className="footer__contact-list">
              <li>
                <MapPin size={16} />
                <span>123 Fashion Street, Mumbai, MH 400001</span>
              </li>
              <li>
                <Phone size={16} />
                <span>+91 98765 43210</span>
              </li>
              <li>
                <Mail size={16} />
                <span>hello@tarikclothing.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            © {new Date().getFullYear()} Tarik Clothing. All rights reserved.
          </p>
          <div className="footer__bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
          <div className="footer__payment">
            <span className="footer__payment-label">We Accept</span>
            <div className="footer__payment-icons">
              <span className="payment-icon">VISA</span>
              <span className="payment-icon">MC</span>
              <span className="payment-icon">UPI</span>
              <span className="payment-icon">COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
