import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy – SpotFinder',
  description: 'SpotFinder Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Last updated: May 2026</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>1. Information We Collect</h2>
        <p>SpotFinder collects the following information when you use our app:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li><strong>Account information:</strong> email address, display name, username, and profile photo you provide.</li>
          <li><strong>Content you create:</strong> posts, captions, and place reviews.</li>
          <li><strong>Usage data:</strong> screens viewed, features used, and interactions within the app.</li>
          <li><strong>Device information:</strong> device type, operating system version, and push notification token.</li>
          <li><strong>Location data:</strong> only when you explicitly search for nearby places. We do not track your location in the background.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>2. How We Use Your Information</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>To operate and improve the SpotFinder service.</li>
          <li>To personalize your feed and place recommendations.</li>
          <li>To send push notifications you have opted in to receive.</li>
          <li>To respond to your support requests.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>3. Information Sharing</h2>
        <p>We do not sell your personal data. We share data only with:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li><strong>Cloudinary</strong> – for storing and delivering images you upload.</li>
          <li><strong>Expo</strong> – for delivering push notifications.</li>
          <li>Authorities if required by law.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>4. Data Retention & Deletion</h2>
        <p>You may delete your account at any time from <strong>Profile → Delete Account</strong> within the app. Upon deletion, your personal data (email, username, password) is permanently anonymized. Content you created (posts, reviews) may be retained in anonymized form.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>5. Security</h2>
        <p>We use industry-standard encryption (TLS) for data in transit and store passwords as secure hashes. We never store your password in plain text.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>6. Children's Privacy</h2>
        <p>SpotFinder is not directed at children under 13. We do not knowingly collect personal information from children under 13.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>7. Changes to This Policy</h2>
        <p>We may update this policy from time to time. We will notify you of significant changes through the app or via email.</p>
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>8. Contact</h2>
        <p>If you have questions about this policy, contact us at <a href="mailto:support@sptfinder.com" style={{ color: '#6c63ff' }}>support@sptfinder.com</a>.</p>
      </section>
    </div>
  );
}
