# Stripe Subscription Setup Guide

This application now has a complete subscription system for business users. Here's how to complete the Stripe integration:

## Features Implemented

### ✅ Database Schema
- `subscription_plans` - Store subscription plans with pricing and features
- `user_subscriptions` - Track active subscriptions
- `payment_history` - Record payment transactions
- Default plans created: Free Trial, Basic ($29.99), Professional ($79.99), Enterprise ($199.99)

### ✅ Admin Features
- **Subscription Management Panel** (Admin → Subscriptions tab)
  - Create/Edit/Delete subscription plans
  - View all active subscriptions
  - Manually grant subscriptions to business users
  - View payment history

### ✅ Business User Features
- **Subscription Page** (Business → Subscription tab)
  - View available plans
  - See current subscription status
  - Cancel subscriptions
  - Upgrade/downgrade plans

### ✅ System Features
- Subscription status banner (shows if no active subscription or expiring soon)
- `useSubscription` hook to check subscription status
- Feature restrictions based on subscription limits

## Stripe Integration Steps

### 1. Create Stripe Account
1. Go to https://stripe.com and sign up
2. Complete account verification
3. Get your API keys from Dashboard → Developers → API Keys

### 2. Configure Environment Variables
Add to your `.env` file:
```bash
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

### 3. Create Products in Stripe
For each plan in your database:
1. Go to Stripe Dashboard → Products
2. Create a product (e.g., "Basic Plan")
3. Add a recurring price (e.g., $29.99/month)
4. Copy the Price ID (starts with `price_...`)
5. Update your database:
```sql
UPDATE subscription_plans
SET stripe_price_id = 'price_xxxxx'
WHERE name = 'Basic';
```

### 4. Create Stripe Checkout Session (Backend)
Create an API endpoint to handle checkout:

```typescript
// Example endpoint: POST /api/create-checkout-session
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, userId, userEmail } = req.body;

  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${process.env.APP_URL}/subscription?success=true`,
    cancel_url: `${process.env.APP_URL}/subscription?cancelled=true`,
    metadata: {
      userId: userId,
    },
  });

  res.json({ sessionId: session.id });
});
```

### 5. Update Frontend Checkout
In `src/components/Business/SubscriptionPage.tsx`, replace the placeholder:

```typescript
const handleSubscribe = async (plan: SubscriptionPlan) => {
  // Call your backend to create checkout session
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId: plan.stripe_price_id,
      userId: user?.id,
      userEmail: user?.email,
    }),
  });

  const { sessionId } = await response.json();

  // Redirect to Stripe Checkout
  const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  await stripe.redirectToCheckout({ sessionId });
};
```

### 6. Set Up Webhooks
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe-webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. Create webhook handler:

```typescript
app.post('/api/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Create subscription in database
      await supabase.from('user_subscriptions').insert({
        user_id: session.metadata.userId,
        plan_id: session.metadata.planId,
        status: 'active',
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      // Record payment
      await supabase.from('payment_history').insert({
        user_id: invoice.metadata.userId,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        stripe_payment_intent_id: invoice.payment_intent,
        stripe_invoice_id: invoice.id,
        status: 'succeeded',
        payment_date: new Date(),
      });
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      // Update subscription status
      await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', subscription.id);
      break;
  }

  res.json({ received: true });
});
```

## Testing

### Test Mode
1. Use Stripe test keys (start with `pk_test_` and `sk_test_`)
2. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0027 6000 3184`
3. Use any future expiry date and CVC

### Manual Grant (For Testing)
Admin users can manually grant subscriptions without Stripe:
1. Go to Admin → Subscriptions
2. Click "Grant Subscription"
3. Select business user and plan
4. Set duration
5. Click Grant

## Feature Restrictions

Use the `useSubscription` hook to restrict features:

```typescript
import { useSubscription } from '../hooks/useSubscription';

function MyComponent() {
  const subscription = useSubscription();

  if (!subscription.hasActiveSubscription) {
    return <div>Subscribe to access this feature</div>;
  }

  // Check limits
  if (employeeCount >= subscription.maxEmployees) {
    return <div>Upgrade to add more employees</div>;
  }

  // Feature available
  return <div>Feature content</div>;
}
```

## Current Status

✅ Database schema created
✅ Admin management panel complete
✅ Business user subscription page complete
✅ Subscription status checks implemented
⏳ Stripe checkout integration (placeholder - needs API keys)
⏳ Webhook handlers (needs backend endpoint)

## Need Help?

For Stripe integration questions:
- Stripe Docs: https://stripe.com/docs
- Stripe Support: support@stripe.com
- This app uses React + Supabase + Stripe

## Security Notes

- Never expose Stripe secret keys in frontend code
- Always verify webhooks with signature
- Use HTTPS in production
- Store customer IDs securely
- Follow PCI compliance guidelines
