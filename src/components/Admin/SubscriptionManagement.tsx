import React, { useState, useEffect } from 'react';
import { CreditCard, Users, DollarSign, Calendar, Check, X, Plus, Edit2, Trash2, Gift } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  max_employees: number;
  max_jobs: number;
  stripe_price_id: string | null;
  active: boolean;
}

interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  granted_by_admin: boolean;
  users: { email: string; business_name: string };
  subscription_plans: { name: string; price: number };
}

export function SubscriptionManagement() {
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions' | 'payments'>('plans');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'plans') {
      await loadPlans();
    } else if (activeTab === 'subscriptions') {
      await loadSubscriptions();
    }
    setLoading(false);
  };

  const loadPlans = async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });

    if (!error && data) {
      setPlans(data);
    }
  };

  const loadSubscriptions = async () => {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        users!inner(email, business_name),
        subscription_plans!inner(name, price)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSubscriptions(data as any);
    }
  };

  const savePlan = async (planData: Partial<SubscriptionPlan>) => {
    if (editingPlan) {
      await supabase
        .from('subscription_plans')
        .update(planData)
        .eq('id', editingPlan.id);
    } else {
      await supabase
        .from('subscription_plans')
        .insert([planData]);
    }
    setShowPlanModal(false);
    setEditingPlan(null);
    loadPlans();
  };

  const deletePlan = async (id: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);
      loadPlans();
    }
  };

  const togglePlanActive = async (id: string, active: boolean) => {
    await supabase
      .from('subscription_plans')
      .update({ active: !active })
      .eq('id', id);
    loadPlans();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
        <p className="text-gray-600">Manage subscription plans and user subscriptions</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'plans'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <CreditCard className="w-5 h-5 inline mr-2" />
          Subscription Plans
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'subscriptions'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Users className="w-5 h-5 inline mr-2" />
          Active Subscriptions
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'payments'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <DollarSign className="w-5 h-5 inline mr-2" />
          Payment History
        </button>
      </div>

      {activeTab === 'plans' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Subscription Plans</h2>
            <button
              onClick={() => {
                setEditingPlan(null);
                setShowPlanModal(true);
              }}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Add New Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-md p-6 border-2 ${
                  plan.active ? 'border-green-500' : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingPlan(plan);
                        setShowPlanModal(true);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Edit2 className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>

                <div className="space-y-2 mb-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => togglePlanActive(plan.id, plan.active)}
                    className={`w-full px-4 py-2 rounded-lg font-medium ${
                      plan.active
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {plan.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Active Subscriptions</h2>
            <button
              onClick={() => setShowGrantModal(true)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium"
            >
              <Gift className="w-5 h-5 inline mr-2" />
              Grant Subscription
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period End</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sub.users.business_name}</div>
                      <div className="text-sm text-gray-500">{sub.users.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sub.subscription_plans.name}</div>
                      <div className="text-sm text-gray-500">${sub.subscription_plans.price}/mo</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sub.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : sub.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sub.current_period_end).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sub.granted_by_admin ? (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          Admin Granted
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Stripe
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-red-600 hover:text-red-900">Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Payment History</h2>
          <p className="text-gray-600">Payment history will be displayed here</p>
        </div>
      )}

      {showPlanModal && <PlanModal plan={editingPlan} onSave={savePlan} onClose={() => setShowPlanModal(false)} />}
      {showGrantModal && <GrantSubscriptionModal plans={plans} onClose={() => setShowGrantModal(false)} onGrant={loadSubscriptions} />}
    </div>
  );
}

function PlanModal({
  plan,
  onSave,
  onClose,
}: {
  plan: SubscriptionPlan | null;
  onSave: (data: Partial<SubscriptionPlan>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    price: plan?.price || 0,
    max_employees: plan?.max_employees || 10,
    max_jobs: plan?.max_jobs || 50,
    features: plan?.features?.join('\n') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      features: formData.features.split('\n').filter((f) => f.trim()),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">{plan ? 'Edit Plan' : 'Create New Plan'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Employees</label>
            <input
              type="number"
              value={formData.max_employees}
              onChange={(e) => setFormData({ ...formData, max_employees: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Jobs/Month</label>
            <input
              type="number"
              value={formData.max_jobs}
              onChange={(e) => setFormData({ ...formData, max_jobs: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
            <textarea
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={5}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
              Save Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GrantSubscriptionModal({
  plans,
  onClose,
  onGrant,
}: {
  plans: SubscriptionPlan[];
  onClose: () => void;
  onGrant: () => void;
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data } = await supabase.from('users').select('*').eq('role', 'business');
    if (data) setUsers(data);
  };

  const handleGrant = async () => {
    if (!selectedUser || !selectedPlan) return;

    const { data: currentUser } = await supabase.auth.getUser();

    await supabase.from('user_subscriptions').insert([
      {
        user_id: selectedUser,
        plan_id: selectedPlan,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000).toISOString(),
        granted_by_admin: true,
        granted_by: currentUser?.user?.id,
      },
    ]);

    onGrant();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Grant Subscription</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Business User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.business_name} ({user.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Plan</label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select a plan...</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} (${plan.price}/mo)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (months)</label>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleGrant}
              disabled={!selectedUser || !selectedPlan}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg disabled:bg-gray-400"
            >
              Grant Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
