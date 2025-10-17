import React, { useState } from 'react';
import { FileText, Send, ArrowRight, DollarSign, Plus, X, Mail } from 'lucide-react';
import { Job } from '../../types';

interface QuotationScreenProps {
  job: Job;
  onComplete: (data: { quotation: number; quotationSent: boolean; status?: string }) => void;
  onCancel?: () => void;
}

export function QuotationScreen({ job, onComplete, onCancel }: QuotationScreenProps) {
  const [quotationAmount, setQuotationAmount] = useState(job.quotation || 0);
  const [quotationSent, setQuotationSent] = useState(job.quotationSent || false);
  const [customerApproved, setCustomerApproved] = useState(false);
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');

  const calculateTotal = () => {
    const productsTotal = (job.selectedProducts || []).reduce((total, product) => 
      total + (product.price * product.quantity), 0
    );
    
    const measurementsCount = (job.measurements || []).length;
    const installationCost = measurementsCount * 50; // £50 per window
    
    return productsTotal + installationCost;
  };

  const handleSendQuotation = async () => {
    try {
      // Send quotation email to customer
      console.log('📧 Sending quotation email to customer');
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setQuotationSent(true);
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successDiv.textContent = 'Quotation sent to customer successfully!';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error sending quotation:', error);
      alert('Failed to send quotation. Please try again.');
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
    } else {
      alert('Please enter a valid email address');
    }
  };

  const handleRemoveEmail = (index: number) => {
    setAdditionalEmails(additionalEmails.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Quotation</h3>
        <p className="text-gray-600">Prepare and send quotation to customer</p>
        {job.quotationSent && (
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => onComplete({ quotation: job.quotation || quotationAmount, quotationSent: true })}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Skip (Already Sent) →
            </button>
          </div>
        )}
      </div>

      {/* Quotation Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Quotation Breakdown</h4>
        
        {/* Products */}
        <div className="space-y-3 mb-4">
          <h5 className="text-sm font-medium text-gray-700">Selected Products</h5>
          {(job.selectedProducts || []).map(product => (
            <div key={product.id} className="flex justify-between items-center">
              <span className="text-gray-900">{product.productName} × {product.quantity}</span>
              <span className="font-medium">${(product.price * product.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Installation Cost */}
        <div className="space-y-3 mb-4 pt-4 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-700">Installation</h5>
          <div className="flex justify-between items-center">
            <span className="text-gray-900">{(job.measurements || []).length} windows × $50</span>
            <span className="font-medium">${((job.measurements || []).length * 50).toFixed(2)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount</span>
            <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Customer Email Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Email Recipients</h4>

        {/* Primary Customer Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Customer Email
          </label>
          <div className="flex items-center space-x-2 text-gray-900 bg-gray-50 p-3 rounded-lg">
            <Mail className="w-4 h-4 text-gray-500" />
            <span>customer@example.com</span>
          </div>
        </div>

        {/* Additional Emails */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Recipients
          </label>

          {additionalEmails.length > 0 && (
            <div className="space-y-2 mb-3">
              {additionalEmails.map((email, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">{email}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveEmail(index)}
                    className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
              placeholder="Add another email address"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleAddEmail}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Quotation Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
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
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Quotation Email
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-blue-800 text-sm">
              Quotation has been sent to the customer. What is the customer's decision?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleLockInQuotation}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Customer Approved - Lock In
              </button>
              <button
                onClick={handleTBD}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                TBD - Customer Deciding
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Continue Button */}
      {quotationSent && (
        <div className="flex justify-end">
          <button
            onClick={() => onComplete({ quotation: calculateTotal(), quotationSent: true })}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue to Payment
            <ArrowRight className="w-4 h-4 ml-2 inline" />
          </button>
        </div>
      )}
    </div>
  );
}