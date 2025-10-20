import React, { useState } from 'react';
import { FileText, Send, ArrowRight, DollarSign, Plus, X, Mail, CheckCircle } from 'lucide-react';
import { Job } from '../../types';
import { EmailService } from '../../services/EmailService';
import { useData } from '../../contexts/DataContext';

interface QuotationScreenProps {
  job: Job;
  onComplete: (data: { quotation: number; quotationSent: boolean; status?: string }) => void;
  onCancel?: () => void;
}

export function QuotationScreen({ job, onComplete, onCancel }: QuotationScreenProps) {
  const { customers, addNotification } = useData();
  const [quotationAmount, setQuotationAmount] = useState(job.quotation || 0);
  const [quotationSent, setQuotationSent] = useState(job.quotationSent || false);
  const [customerApproved, setCustomerApproved] = useState(false);
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const calculateTotal = () => {
    const productsTotal = (job.selectedProducts || []).reduce((total, product) =>
      total + (product.price * product.quantity), 0
    );

    const measurementsCount = (job.measurements || []).length;
    const installationCost = measurementsCount * 50;

    return productsTotal + installationCost;
  };

  const handleSendQuotation = async () => {
    try {
      setSendingEmail(true);

      const customer = customers.find(c => c.id === job.customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      const quotationData = {
        customerName: customer.name,
        customerEmail: customer.email,
        jobTitle: job.title,
        jobId: job.id,
        quotationAmount: quotationAmount,
        jobDescription: job.description,
        items: job.selectedProducts?.map(p => ({
          name: p.productName,
          quantity: p.quantity,
          price: p.price
        }))
      };

      const success = await EmailService.sendQuotationEmail(quotationData);

      if (success) {
        setQuotationSent(true);

        await addNotification({
          userId: job.employeeId || '',
          type: 'quotation_sent',
          title: 'Quotation Sent',
          message: `Quotation for "${job.title}" sent to ${customer.name}`,
          read: false
        });

        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successDiv.textContent = 'Quotation sent to customer successfully!';
        document.body.appendChild(successDiv);

        setTimeout(() => {
          if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv);
          }
        }, 3000);
      } else {
        throw new Error('Email sending failed');
      }
    } catch (error) {
      console.error('Error sending quotation:', error);
      alert('Failed to send quotation. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleLockInQuotation = () => {
    setCustomerApproved(true);
    onComplete({
      quotation: quotationAmount,
      quotationSent: true,
      status: 'confirmed'
    });
  };

  const handleTBD = () => {
    if (onCancel) {
      onCancel();
    } else {
      onComplete({
        quotation: quotationAmount,
        quotationSent: true,
        status: 'tbd'
      });
    }
  };

  const handleAddEmail = () => {
    if (newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setAdditionalEmails([...additionalEmails, newEmail]);
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (index: number) => {
    setAdditionalEmails(additionalEmails.filter((_, i) => i !== index));
  };

  const suggestedTotal = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-900">Generate Quotation</h2>
        </div>
        <p className="text-gray-600">Create and send quotation to customer</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quotation Amount</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Final Quotation Amount ($)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={quotationAmount}
              onChange={(e) => setQuotationAmount(Number(e.target.value))}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
              min="0"
              step="0.01"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Suggested total based on products: ${suggestedTotal.toLocaleString()}
          </p>
        </div>

        <button
          onClick={() => setQuotationAmount(suggestedTotal)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Use suggested amount
        </button>
      </div>

      {job.selectedProducts && job.selectedProducts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Selected Products</h4>
          <div className="space-y-2">
            {job.selectedProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-700">{product.productName} x {product.quantity}</span>
                <span className="font-semibold text-gray-900">${(product.price * product.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-blue-900">Send Quotation to Customer</h4>
          {quotationSent && (
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
              ✓ Sent
            </span>
          )}
        </div>

        {!quotationSent ? (
          <div>
            <p className="text-sm text-blue-800 mb-3">
              Quotation will be sent to {1 + additionalEmails.length} recipient(s)
            </p>
            <button
              onClick={handleSendQuotation}
              disabled={sendingEmail}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 mr-2" />
              {sendingEmail ? 'Sending...' : 'Send Quotation Email'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-blue-800 text-sm">
              ✓ Quotation email has been sent to customer
            </p>

            {!customerApproved && (
              <div className="flex space-x-3">
                <button
                  onClick={handleLockInQuotation}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Customer Approved - Lock In
                </button>
                <button
                  onClick={handleTBD}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Mark as TBD
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {customerApproved && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Quotation Approved!</h3>
          <p className="text-gray-600">Proceeding to next step</p>
        </div>
      )}
    </div>
  );
}

export default QuotationScreen;
