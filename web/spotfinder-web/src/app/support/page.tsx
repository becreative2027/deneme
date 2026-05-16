import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support – SpotFinder',
  description: 'SpotFinder Support',
};

export default function SupportPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Support</h1>
      <p style={{ color: '#666', marginBottom: 40 }}>We're here to help. Reach out through any of the channels below.</p>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Contact Us</h2>
        <p>Email: <a href="mailto:support@sptfinder.com" style={{ color: '#6c63ff', fontWeight: 500 }}>support@sptfinder.com</a></p>
        <p style={{ marginTop: 8, color: '#555' }}>We typically respond within 1–2 business days.</p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Frequently Asked Questions</h2>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600 }}>How do I delete my account?</p>
          <p style={{ color: '#555' }}>Go to <strong>Profile</strong> tab → tap the trash icon next to "Edit Profile" → confirm deletion. Your account and personal data will be permanently removed.</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600 }}>How do I reset my password?</p>
          <p style={{ color: '#555' }}>Password reset is currently done via our support email. Contact us at support@sptfinder.com with your registered email address.</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600 }}>How do I report inappropriate content?</p>
          <p style={{ color: '#555' }}>Email us at support@sptfinder.com with details of the content you'd like to report. We review all reports within 48 hours.</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600 }}>How do I turn off notifications?</p>
          <p style={{ color: '#555' }}>Go to your device's <strong>Settings → SpotFinder → Notifications</strong> and toggle them off.</p>
        </div>

        <div>
          <p style={{ fontWeight: 600 }}>My post didn't upload. What should I do?</p>
          <p style={{ color: '#555' }}>Check your internet connection and try again. If the issue persists, please contact us with your device model and iOS version.</p>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Legal</h2>
        <p><a href="/privacy" style={{ color: '#6c63ff' }}>Privacy Policy</a></p>
        <p style={{ marginTop: 6 }}><a href="/terms" style={{ color: '#6c63ff' }}>Terms of Service</a></p>
      </section>
    </div>
  );
}
