import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service – SpotFinder',
  description: 'SpotFinder Terms of Service',
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Last updated: May 2026</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>1. Acceptance of Terms</h2>
        <p>By creating an account or using SpotFinder, you agree to these Terms of Service. If you do not agree, please do not use the app.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>2. Your Account</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>You are responsible for keeping your account credentials secure.</li>
          <li>You must be at least 13 years old to use SpotFinder.</li>
          <li>One person may not maintain multiple accounts.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>3. User Content</h2>
        <p>You retain ownership of content you post. By posting, you grant SpotFinder a non-exclusive, royalty-free license to display and distribute your content within the app. You are solely responsible for content you post and must ensure it does not:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>Violate any applicable law or regulation.</li>
          <li>Infringe third-party intellectual property rights.</li>
          <li>Contain harassment, hate speech, or explicit material.</li>
          <li>Contain spam or misleading information.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>4. Prohibited Conduct</h2>
        <p>You may not use SpotFinder to:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li>Scrape or harvest data from the platform.</li>
          <li>Attempt to gain unauthorized access to any system.</li>
          <li>Impersonate any person or entity.</li>
          <li>Interfere with the proper functioning of the service.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>5. Termination</h2>
        <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from within the app.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>6. Disclaimer of Warranties</h2>
        <p>SpotFinder is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or that place information will be accurate or up to date.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>7. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, SpotFinder shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>8. Contact</h2>
        <p>Questions about these terms? Email us at <a href="mailto:support@sptfinder.com" style={{ color: '#6c63ff' }}>support@sptfinder.com</a>.</p>
      </section>
    </div>
  );
}
