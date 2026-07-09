import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import './LegalPages.css'

const ContactPage = () => {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
    setForm({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  return (
    <>
      <Navbar />
      <main className="legal-page">
        <div className="container">
          <div className="legal-page__header">
            <h1 className="legal-page__title">Contact Us</h1>
            <p className="legal-page__subtitle">We'd love to hear from you. Get in touch with us.</p>
          </div>

          <div className="contact-page__grid">
            {/* Contact Info Cards */}
            <div className="contact-page__info-cards">
              <div className="contact-page__card">
                <div className="contact-page__card-icon">
                  <Phone size={22} />
                </div>
                <div>
                  <h3>Call Us</h3>
                  <a href="tel:+918448032994">+91 8448032994</a>
                  <p>Mon - Sat, 10 AM - 7 PM</p>
                </div>
              </div>

              <div className="contact-page__card">
                <div className="contact-page__card-icon">
                  <Mail size={22} />
                </div>
                <div>
                  <h3>Email Us</h3>
                  <a href="mailto:tarikfashioncompany@gmail.com">tarikfashioncompany@gmail.com</a>
                  <p>We'll respond within 24 hours</p>
                </div>
              </div>

              <div className="contact-page__card">
                <div className="contact-page__card-icon">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3>Visit Us</h3>
                  <p>Tarik Fashion Company</p>
                  <p>India</p>
                </div>
              </div>

              <div className="contact-page__card">
                <div className="contact-page__card-icon">
                  <Clock size={22} />
                </div>
                <div>
                  <h3>Business Hours</h3>
                  <p>Monday - Saturday: 10:00 AM - 7:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-page__form-card">
              <h2>Send Us a Message</h2>

              {submitted && (
                <div style={{ padding: '12px 16px', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: '8px', marginBottom: '20px', color: '#c9a96e', fontSize: '14px' }}>
                  ✅ Thank you! Your message has been sent. We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="contact-page__row">
                  <div className="contact-page__field">
                    <label>Your Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Rahul Sharma" required />
                  </div>
                  <div className="contact-page__field">
                    <label>Phone Number</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9876543210" />
                  </div>
                </div>

                <div className="contact-page__field">
                  <label>Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="rahul@example.com" />
                </div>

                <div className="contact-page__field">
                  <label>Subject *</label>
                  <input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="How can we help you?" required />
                </div>

                <div className="contact-page__field">
                  <label>Message *</label>
                  <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Write your message here..." rows={5} required />
                </div>

                <button type="submit" className="contact-page__submit">
                  <Send size={18} /> Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default ContactPage
