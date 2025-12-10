// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, phone } = await request.json();

    if (!name || !email || !company) {
      return NextResponse.json(
        { error: 'Name, email, and company are required' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Pragma Score Assessment',
              description: '6-dimension operational diagnostic with AI-powered insights',
            },
            unit_amount: 150000, // $1,500.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/assessment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/assessment/start`,
      customer_email: email,
      metadata: {
        name,
        email,
        company,
        phone: phone || '',
      },
    });

    // Create assessment record in Supabase
    const supabase = createServerClient();
    const { error: dbError } = await supabase.from('assessments').insert({
      name,
      email,
      company,
      phone: phone || null,
      status: 'not_started',
      current_step: 0,
      stripe_session_id: session.id,
    });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue anyway - Stripe session is created
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
