import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — BuyDSTV',
  description: 'Privacy policy for BuyDSTV.com.ng — how we collect, use, and protect your personal data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-10 text-sm">
          Last updated: {new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="space-y-8 text-gray-300 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              BuyDSTV (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the website{' '}
              <a href="https://buydstv.com.ng" className="text-primary hover:underline">buydstv.com.ng</a>.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you visit our website and purchase products and services from us, in compliance with
              the Nigeria Data Protection Regulation (NDPR) 2019 and the Nigeria Data Protection Act (NDPA) 2023.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect the following personal information when you use our services:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Account Information:</strong> Full name, email address, phone number, and delivery address when you register.</li>
              <li><strong>Payment Information:</strong> Payment details are processed securely by Paystack. We do not store your card details on our servers.</li>
              <li><strong>Order Information:</strong> Products purchased, order references, amounts, and delivery details.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, and usage data collected automatically when you browse our site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use your personal data for the following purposes:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>To create and manage your account.</li>
              <li>To process and fulfill your orders, including delivery.</li>
              <li>To process payments securely through our payment partner (Paystack).</li>
              <li>To send transactional emails (registration confirmation, order confirmation, password resets).</li>
              <li>To communicate with you about your orders or account.</li>
              <li>To improve our website and services.</li>
              <li>To prevent fraud and ensure security.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Legal Basis for Processing</h2>
            <p>
              We process your personal data based on: (a) your consent provided at registration;
              (b) the necessity to perform our contract with you (order fulfillment);
              (c) our legitimate business interests; and (d) compliance with legal obligations
              under Nigerian law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Payment Processing</h2>
            <p>
              All payments are processed by{' '}
              <a href="https://paystack.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Paystack</a>,
              a PCI-DSS compliant payment processor licensed by the Central Bank of Nigeria.
              Your card details are encrypted and handled directly by Paystack — we never have access
              to your full card number or CVV.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Data Sharing</h2>
            <p className="mb-3">We may share your information with:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Payment Processor:</strong> Paystack, for processing your payments.</li>
              <li><strong>Delivery Partners:</strong> To fulfill and deliver your orders.</li>
              <li><strong>Law Enforcement:</strong> When required by Nigerian law or regulation.</li>
            </ul>
            <p className="mt-3">We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data,
              including encrypted connections (HTTPS/TLS), secure password hashing, and access controls.
              However, no method of transmission over the internet is 100% secure, and we cannot guarantee
              absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to provide
              our services. Order records are retained for a minimum of 6 years for accounting and legal
              purposes, in accordance with Nigerian commercial law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Your Rights (NDPR)</h2>
            <p className="mb-3">Under the Nigeria Data Protection Regulation, you have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your personal data (subject to legal obligations).</li>
              <li>Object to or restrict certain processing of your data.</li>
              <li>Withdraw consent at any time.</li>
              <li>Lodge a complaint with the National Information Technology Development Agency (NITDA).</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:support@buydstv.com.ng" className="text-primary hover:underline">support@buydstv.com.ng</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Cookies</h2>
            <p>
              We use essential cookies to maintain your session and authentication state.
              These are necessary for the website to function properly. We do not use tracking
              or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under the age of 18. We do not knowingly
              collect personal data from children. If you are a parent or guardian and believe your
              child has provided us with personal data, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page
              with an updated &quot;Last updated&quot; date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-3 bg-dark-card border border-gray-800 rounded-xl p-5 space-y-2">
              <p><strong className="text-white">Email:</strong>{' '}
                <a href="mailto:support@buydstv.com.ng" className="text-primary hover:underline">support@buydstv.com.ng</a>
              </p>
              <p><strong className="text-white">WhatsApp:</strong>{' '}
                <a href="https://wa.me/2349164633598" className="text-primary hover:underline">09164633598</a>
              </p>
              <p><strong className="text-white">Website:</strong>{' '}
                <a href="https://buydstv.com.ng" className="text-primary hover:underline">buydstv.com.ng</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
