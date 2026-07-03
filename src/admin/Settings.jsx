import { Settings as SettingsIcon } from 'lucide-react'

const Settings = () => (
  <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)' }}>
    <SettingsIcon size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
    <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)', marginBottom: '0.5rem' }}>Store Settings</h2>
    <p>Coming soon — store configuration, payment gateway setup, and shipping settings.</p>
  </div>
)

export default Settings
