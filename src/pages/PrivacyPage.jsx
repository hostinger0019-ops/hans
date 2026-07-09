import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './LegalPages.css'

const PrivacyPage = () => {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      <Navbar />
      <main className="legal-page">
        <div className="container">
          <div className="legal-page__header">
            <h1 className="legal-page__title">Privacy Policy</h1>
            <p className="legal-page__subtitle">Last updated: July 2026</p>
          </div>

          <div className="legal-page__content">
            <div className="legal-page__section">
              <h2>1. Introduction</h2>
              <p>Tarik Fashion Company ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website tarikclothing.com or make a purchase.</p>
            </div>

            <div className="legal-page__section">
              <h2>2. Information We Collect</h2>
              <h3>Personal Information</h3>
              <p>When you place an order or create an account, we may collect:</p>
              <ul>
                <li>Full name and contact details</li>
                <li>Email address and phone number</li>
                <li>Shipping and billing address</li>
                <li>Payment information (processed securely by Razorpay)</li>
              </ul>

              <h3>Automatically Collected Information</h3>
              <ul>
                <li>IP address and browser type</li>
                <li>Device information and operating system</li>
                <li>Pages visited and time spent on the website</li>
                <li>Referring website or search terms</li>
              </ul>
            </div>

            <div className="legal-page__section">
              <h2>3. How We Use Your Information</h2>
              <p>We use your personal information to:</p>
              <ul>
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Respond to your inquiries and customer service requests</li>
                <li>Improve our website and product offerings</li>
                <li>Send promotional communications (only with your consent)</li>
                <li>Prevent fraud and ensure website security</li>
              </ul>
            </div>

            <div className="legal-page__section">
              <h2>4. Payment Security</h2>
              <p>All payment transactions are processed securely through Razorpay. We do not store your credit card, debit card, or bank account details on our servers. Razorpay uses industry-standard 256-bit SSL encryption to protect your payment information.</p>
            </div>

            <div className="legal-page__section">
              <h2>5. Data Sharing</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only with:</p>
              <ul>
                <li>Shipping and logistics partners (for order delivery)</li>
                <li>Payment processors (Razorpay)</li>
                <li>Law enforcement (when required by law)</li>
              </ul>
            </div>

            <div className="legal-page__section">
              <h2>6. Cookies</h2>
              <p>Our website uses cookies to enhance your browsing experience. Cookies are small files stored on your device that help us remember your preferences, cart items, and login sessions. You can disable cookies in your browser settings, though some features may not work properly.</p>
            </div>

            <div className="legal-page__section">
              <h2>7. Data Retention</h2>
              <p>We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, comply with legal obligations, and resolve disputes. Order records are kept for a minimum of 5 years for tax and compliance purposes.</p>
            </div>

            <div className="legal-page__section">
              <h2>8. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal data</li>
                <li>Opt out of marketing communications</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </div>

            <div className="legal-page__section">
              <h2>9. Contact Us</h2>
              <p>If you have questions about this Privacy Policy or wish to exercise your rights, contact us at:</p>
              <ul>
                <li>Email: tarikfashioncompany@gmail.com</li>
                <li>Phone: +91 8448032994</li>
                <li>Company: Tarik Fashion Company</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default PrivacyPage
