import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './LegalPages.css'

const TermsPage = () => {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      <Navbar />
      <main className="legal-page">
        <div className="container">
          <div className="legal-page__header">
            <h1 className="legal-page__title">Terms & Conditions</h1>
            <p className="legal-page__subtitle">Last updated: July 2026</p>
          </div>

          <div className="legal-page__content">
            <div className="legal-page__section">
              <h2>1. Introduction</h2>
              <p>Welcome to Tarik Fashion Company ("we", "us", "our"). These Terms and Conditions govern your use of our website tarikclothing.com and the purchase of products from our online store. By accessing or using our website, you agree to be bound by these terms.</p>
            </div>

            <div className="legal-page__section">
              <h2>2. Use of Website</h2>
              <p>You may use our website for lawful purposes only. You agree not to:</p>
              <ul>
                <li>Use the website in any way that violates applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to any part of the website</li>
                <li>Use the website to transmit any harmful or malicious content</li>
                <li>Reproduce, duplicate, or copy any material from the website without permission</li>
              </ul>
            </div>

            <div className="legal-page__section">
              <h2>3. Products & Pricing</h2>
              <p>All product descriptions, images, and prices on our website are as accurate as possible. However, we reserve the right to:</p>
              <ul>
                <li>Modify prices without prior notice</li>
                <li>Correct any errors in product listings</li>
                <li>Limit quantities available for purchase</li>
                <li>Refuse or cancel any order at our discretion</li>
              </ul>
              <p>Prices are listed in Indian Rupees (₹) and include applicable GST unless otherwise stated.</p>
            </div>

            <div className="legal-page__section">
              <h2>4. Orders & Payment</h2>
              <p>When you place an order, you are making an offer to purchase. We reserve the right to accept or decline your order. Payment can be made via Razorpay (Cards, UPI, Wallets, Net Banking) or Cash on Delivery (COD).</p>
              <p>A COD fee of ₹49 may apply. All online payments are processed securely through Razorpay's payment gateway.</p>
            </div>

            <div className="legal-page__section">
              <h2>5. Shipping & Delivery</h2>
              <ul>
                <li>Free shipping on orders above ₹999</li>
                <li>Standard delivery within 5-7 business days</li>
                <li>Express delivery available in select cities</li>
                <li>We ship across India via trusted courier partners</li>
              </ul>
            </div>

            <div className="legal-page__section">
              <h2>6. Returns & Exchanges</h2>
              <p>We offer a 7-day easy return policy from the date of delivery. Items must be unused, unwashed, and in original packaging with tags attached. Refunds will be processed within 5-7 business days after receiving the returned item.</p>
            </div>

            <div className="legal-page__section">
              <h2>7. Intellectual Property</h2>
              <p>All content on this website, including text, graphics, logos, images, and software, is the property of Tarik Fashion Company and is protected by Indian and international copyright laws.</p>
            </div>

            <div className="legal-page__section">
              <h2>8. Limitation of Liability</h2>
              <p>Tarik Fashion Company shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our liability is limited to the purchase price of the product.</p>
            </div>

            <div className="legal-page__section">
              <h2>9. Contact Information</h2>
              <p>For any questions regarding these Terms & Conditions, please contact us:</p>
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

export default TermsPage
