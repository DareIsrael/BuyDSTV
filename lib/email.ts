import nodemailer from 'nodemailer';
import type { IOrder } from '@/types/order';

/**
 * Reusable email service for BuyDSTV.
 * All emails use a shared transporter configured via SMTP env vars.
 */

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    console.error('SMTP configuration error: SMTP_HOST, SMTP_USER, and SMTP_PASSWORD environment variables are required.');
    throw new Error('SMTP service is not configured');
  }

  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const isSecure = process.env.SMTP_SECURE !== 'false';

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
  });
}

function getFromAddress() {
  return {
    name: 'BuyDSTV',
    address: process.env.SMTP_USER || 'noreply@buydstv.com.ng',
  };
}

function formatNaira(amountInKobo: number): string {
  return `₦${(amountInKobo / 100).toLocaleString('en-NG')}`;
}

// ─── Shared HTML wrapper ─────────────────────────────────────────────

function wrapHtml(content: string): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f9fafb;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px 32px;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">BuyDSTV</h1>
      </div>
      <div style="padding: 32px; background: white;">
        ${content}
      </div>
      <div style="padding: 16px 32px; background: #f3f4f6; text-align: center; font-size: 12px; color: #6b7280;">
        <p style="margin: 0;">© ${new Date().getFullYear()} BuyDSTV. All rights reserved.</p>
        <p style="margin: 4px 0 0;">
          <a href="https://buydstv.com.ng/privacy-policy" style="color: #6366f1; text-decoration: none;">Privacy Policy</a>
        </p>
      </div>
    </div>
  `;
}

// ─── Welcome Email ───────────────────────────────────────────────────

export async function sendWelcomeEmail(name: string, email: string) {
  try {
    const transporter = createTransporter();

    const html = wrapHtml(`
      <h2 style="color: #111827; margin-top: 0;">Welcome to BuyDSTV, ${escapeHtml(name)}! 🎉</h2>
      <p style="color: #374151; line-height: 1.6;">
        Thank you for creating your account. You can now browse and purchase DSTV and GOTV decoders with subscription packages.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://buydstv.com.ng" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
          Start Shopping
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        If you have any questions, contact us at <a href="mailto:support@buydstv.com.ng" style="color: #6366f1;">support@buydstv.com.ng</a> or WhatsApp: 09164633598.
      </p>
    `);

    await transporter.sendMail({
      from: getFromAddress(),
      to: email,
      subject: 'Welcome to BuyDSTV!',
      text: `Welcome to BuyDSTV, ${name}!\n\nThank you for creating your account. You can now browse and purchase DSTV and GOTV decoders with subscription packages.\n\nVisit us at https://buydstv.com.ng\n\nQuestions? Contact support@buydstv.com.ng or WhatsApp: 09164633598.\n\n© ${new Date().getFullYear()} BuyDSTV. All rights reserved.`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, message: 'Failed to send welcome email' };
  }
}

// ─── Password Reset Email ────────────────────────────────────────────

export async function sendPasswordResetEmail({ to, resetUrl }: { to: string; resetUrl: string }) {
  try {
    const transporter = createTransporter();

    const html = wrapHtml(`
      <h2 style="color: #111827; margin-top: 0;">Password Reset Request</h2>
      <p style="color: #374151; line-height: 1.6;">
        You recently requested to reset your password for your BuyDSTV account. Click the button below to reset it.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${escapeHtml(resetUrl)}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #374151; line-height: 1.6;">
        If you did not request a password reset, please ignore this email. This link is valid for <strong>1 hour</strong>.
      </p>
      <p style="color: #6b7280; font-size: 14px;">
        Thanks,<br>The BuyDSTV Team
      </p>
    `);

    await transporter.sendMail({
      from: getFromAddress(),
      to,
      subject: 'Password Reset Request - BuyDSTV',
      text: `Password Reset Request\n\nYou recently requested to reset your password for your BuyDSTV account.\n\nReset your password here: ${resetUrl}\n\nIf you did not request a password reset, please ignore this email. This link is valid for 1 hour.\n\nThanks,\nThe BuyDSTV Team`,
      html,
    });
    console.log(`Password reset email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, message: 'Failed to send password reset email' };
  }
}

// ─── Purchase Confirmation Email ─────────────────────────────────────

export async function sendPurchaseConfirmationEmail(order: IOrder) {
  try {
    const transporter = createTransporter();

    const html = wrapHtml(`
      <h2 style="color: #111827; margin-top: 0;">Payment Confirmed! ✅</h2>
      <p style="color: #374151; line-height: 1.6;">
        Hi ${escapeHtml(order.customerName)}, your payment has been confirmed and your order is being processed.
      </p>

      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0; border: 1px solid #e5e7eb;">
        <h3 style="color: #111827; margin-top: 0; font-size: 16px;">Order Details</h3>
        <table style="width: 100%; font-size: 14px; color: #374151; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Reference</td>
            <td style="padding: 8px 0; text-align: right; font-family: monospace;">${escapeHtml(order.reference)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Product</td>
            <td style="padding: 8px 0; text-align: right;">${escapeHtml(order.product)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Package</td>
            <td style="padding: 8px 0; text-align: right;">${escapeHtml(order.package)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Delivery Address</td>
            <td style="padding: 8px 0; text-align: right;">${escapeHtml(order.address)}</td>
          </tr>
          <tr style="border-top: 2px solid #e5e7eb;">
            <td style="padding: 12px 0; font-weight: 700; color: #111827;">Total Paid</td>
            <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #6366f1; font-size: 18px;">${formatNaira(order.totalPrice)}</td>
          </tr>
        </table>
      </div>

      <p style="color: #374151; line-height: 1.6;">
        We'll notify you once your order is On the way. If you have any questions, reach us at
        <a href="mailto:support@buydstv.com.ng" style="color: #6366f1;">support@buydstv.com.ng</a>
        or WhatsApp: 09164633598.
      </p>
    `);

    await transporter.sendMail({
      from: getFromAddress(),
      to: order.email,
      subject: `Order Confirmed - ${order.reference}`,
      text: `Payment Confirmed!\n\nHi ${order.customerName}, your payment has been confirmed and your order is being processed.\n\nOrder Details:\n- Reference: ${order.reference}\n- Product: ${order.product}\n- Package: ${order.package}\n- Delivery Address: ${order.address}\n- Total Paid: ${formatNaira(order.totalPrice)}\n\nWe'll notify you once your order is On the way.\n\nQuestions? Contact support@buydstv.com.ng or WhatsApp: 09164633598.\n\n© ${new Date().getFullYear()} BuyDSTV. All rights reserved.`,
      html,
    });
    console.log(`Purchase confirmation email sent to ${order.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending purchase confirmation email:', error);
    return { success: false, message: 'Failed to send purchase confirmation email' };
  }
}

// ─── Utility ─────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
