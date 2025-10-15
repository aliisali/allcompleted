import React, { useState, useEffect } from 'react';
import { CreditCard, Check, AlertCircle, Calendar, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  max_employees: number;
  max_jobs: number;
  stripe_price_id: string | null;
}

interface CurrentSubscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  granted_by_admin: boolean;
  subscription_plans: SubscriptionPlan;
}

export function SubscriptionPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingStripe, setProcessingStripe] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadPlans(), loadCurrentSubscription()]);
    setLoading(false);
  };

  const loadPlans = async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('active', true)
      .order('price', { ascending: true });

    if (!error && data) {
      setPlans(data);
    }
  };

  const loadCurrentSubscription = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!error && data) {
      setCurrentSubscription(data as any);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user?.email) {
      alert('Please log in to subscribe');
      return;
    }

    if (!plan.stripe_price_id) {
      alert('Stripe is not configured for this plan. Please contact admin.');
      return;
    }

    setProcessingStripe(true);

    try {
      alert(
        `Stripe integration placeholder\n\n` +
        `In production, this would:\n` +
        `1. Create Stripe Checkout Session\n` +
        `2. Redirect to Stripe payment page\n` +
        `3. Handle webhook to create subscription\n\n` +
        `For now, contact admin to grant subscription manually.`
      );
    } catch (error) {
      console.error('Stripe error:', error);
      alert('Payment failed. Please try again or contact support.');
    } finally {
      setProcessingStripe(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    if (currentSubscription.granted_by_admin) {
      alert('This subscription was granted by admin. Please contact admin to cancel.');
      return;
    }

    if (
      confirm(
        'Are you sure you want to cancel your subscription? It will remain active until the end of your billing period.'
      )
    ) {
      await supabase
        .from('user_subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('id', currentSubscription.id);

      loadCurrentSubscription();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Plans</h1>
        <p className="text-gray-600">Choose the perfect plan for your business</p>
      </div>

      {currentSubscription && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Active Subscription</h2>
              </div>
              <p className="text-blue-100 mb-4">
                You're currently on the <span className="font-bold">{currentSubscription.subscription_plans.name}</span>{' '}
                plan
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-200">Status</p>
                  <p className="font-semibold text-lg">{currentSubscription.status.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-blue-200">Renewal Date</p>
                  <p className="font-semibold text-lg">
                    {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-blue-200">Price</p>
                  <p className="font-semibold text-lg">${currentSubscription.subscription_plans.price}/month</p>
                </div>
                <div>
                  <p className="text-blue-200">Type</p>
                  <p className="font-semibold text-lg">
                    {currentSubscription.granted_by_admin ? 'Admin Granted' : 'Stripe'}
                  </p>
                </div>
              </div>
            </div>
            <div>
              {!currentSubscription.granted_by_admin && (
                <button
                  onClick={handleCancelSubscription}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>

          {currentSubscription.cancel_at_period_end && (
            <div className="mt-4 bg-yellow-500 bg-opacity-20 border border-yellow-300 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">
                  Your subscription will be cancelled on{' '}
                  {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentSubscription?.plan_id === plan.id;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${
                isCurrentPlan ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-200'
              }`}
            >
              {isCurrentPlan && (
                <div className="bg-blue-500 text-white text-center py-2 font-bold text-sm">CURRENT PLAN</div>
              )}

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan || processingStripe}
                  className={`w-full py-3 px-4 rounded-lg font-bold transition-colors ${
                    isCurrentPlan
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : processingStripe
                      ? 'bg-gray-400 text-white cursor-wait'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isCurrentPlan ? (
                    'Current Plan'
                  ) : processingStripe ? (
                    <>
                      <Loader className="w-5 h-5 inline mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : plan.price === 0 ? (
                    'Start Free Trial'
                  ) : (
                    'Subscribe Now'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Important Information</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• All subscriptions are billed monthly and automatically renew</li>
              <li>• You can cancel your subscription at any time</li>
              <li>• Cancellations take effect at the end of your billing period</li>
              <li>• Stripe handles all payment processing securely</li>
              <li>• For questions, contact support</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
        <p className="text-gray-700 mb-4">
          Contact our sales team to discuss custom enterprise plans or if you have questions about our subscriptions.
        </p>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium">
            Contact Sales
          </button>
          <button className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 rounded-lg font-medium">
            View Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
