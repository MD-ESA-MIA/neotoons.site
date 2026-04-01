import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeClient = new Stripe(stripeSecretKey, {
      apiVersion: '2025-01-27-acacia' as any,
    });
  }
  return stripeClient;
}

export const stripeService = {
  async createCheckoutSession(userId: string, email: string, planId: string, successUrl: string, cancelUrl: string) {
    const stripe = getStripe();
    
    const { dbManager } = await import("./db/DatabaseManager");
    const db = dbManager.getProvider();
    const settings = await db.getSystemSettings();
    
    // Map plan IDs to Stripe Price IDs
    const priceMap: Record<string, string> = {
      'pro_monthly': settings.monetization?.stripePriceProMonthly || process.env.STRIPE_PRICE_PRO_MONTHLY || '',
      'studio_monthly': settings.monetization?.stripePriceStudioMonthly || process.env.STRIPE_PRICE_STUDIO_MONTHLY || '',
    };

    const priceId = priceMap[planId];
    if (!priceId) throw new Error('Invalid plan ID or missing Price ID');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      client_reference_id: userId,
      metadata: {
        userId,
        planId,
      },
    });

    return session;
  },

  async createPortalSession(customerId: string, returnUrl: string) {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session;
  },

  async handleWebhook(payload: string, sig: string) {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is required');

    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch (err: any) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    return event;
  }
};
