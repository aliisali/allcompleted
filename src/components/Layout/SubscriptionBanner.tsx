import React from 'react';
import { AlertCircle, CreditCard } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../contexts/AuthContext';

interface SubscriptionBannerProps {
  onNavigateToSubscription: () => void;
}

export function SubscriptionBanner({ onNavigateToSubscription }: SubscriptionBannerProps) {
  const { user } = useAuth();
  const subscription = useSubscription();

  if (user?.role === 'admin' || subscription.loading) {
    return null;
  }

  if (!subscription.hasActiveSubscription && user?.role === 'business') {
    return (
      <div className="bg-red-500 text-white px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <div>
              <p className="font-bold">No Active Subscription</p>
              <p className="text-sm text-red-100">Subscribe to unlock full features</p>
            </div>
          </div>
          <button
            onClick={onNavigateToSubscription}
            className="px-6 py-2 bg-white text-red-500 rounded-lg font-bold hover:bg-red-50"
          >
            <CreditCard className="w-5 h-5 inline mr-2" />
            View Plans
          </button>
        </div>
      </div>
    );
  }

  if (subscription.hasActiveSubscription && subscription.periodEnd) {
    const daysLeft = Math.ceil(
      (new Date(subscription.periodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft <= 7) {
      return (
        <div className="bg-yellow-500 text-white px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              <div>
                <p className="font-bold">Subscription Expiring Soon</p>
                <p className="text-sm text-yellow-100">
                  Your {subscription.planName} plan expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onNavigateToSubscription}
              className="px-6 py-2 bg-white text-yellow-600 rounded-lg font-bold hover:bg-yellow-50"
            >
              Manage Subscription
            </button>
          </div>
        </div>
      );
    }
  }

  return null;
}
