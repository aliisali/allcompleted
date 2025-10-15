import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  planName: string | null;
  maxEmployees: number;
  maxJobs: number;
  periodEnd: string | null;
  loading: boolean;
}

export function useSubscription(): SubscriptionStatus {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    hasActiveSubscription: false,
    planName: null,
    maxEmployees: 0,
    maxJobs: 0,
    periodEnd: null,
    loading: true,
  });

  useEffect(() => {
    if (!user?.id) {
      setStatus({
        hasActiveSubscription: false,
        planName: null,
        maxEmployees: 0,
        maxJobs: 0,
        periodEnd: null,
        loading: false,
      });
      return;
    }

    if (user.role === 'admin') {
      setStatus({
        hasActiveSubscription: true,
        planName: 'Admin',
        maxEmployees: 999999,
        maxJobs: 999999,
        periodEnd: null,
        loading: false,
      });
      return;
    }

    loadSubscription();
  }, [user?.id]);

  const loadSubscription = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans(name, max_employees, max_jobs)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('current_period_end', new Date().toISOString())
      .single();

    if (!error && data) {
      setStatus({
        hasActiveSubscription: true,
        planName: (data as any).subscription_plans.name,
        maxEmployees: (data as any).subscription_plans.max_employees,
        maxJobs: (data as any).subscription_plans.max_jobs,
        periodEnd: data.current_period_end,
        loading: false,
      });
    } else {
      setStatus({
        hasActiveSubscription: false,
        planName: null,
        maxEmployees: 0,
        maxJobs: 0,
        periodEnd: null,
        loading: false,
      });
    }
  };

  return status;
}
