import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { paymentReminderService } from '@/services/payment-reminder.service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get('authorization') || '';
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Sends abandoned-payment reminder emails. Call on a schedule (e.g. every
 * 10-15 minutes) with header "Authorization: Bearer <CRON_SECRET>".
 * GET is supported for Vercel Cron, POST for other schedulers.
 */
async function handle(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    console.error('CRON_SECRET not configured; payment reminders are disabled');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const summary = await paymentReminderService.processPendingReminders();
    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    console.error('Payment reminder run failed:', error);
    return NextResponse.json({ ok: false, error: 'Reminder run failed' }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;

