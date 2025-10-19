import React, { useState } from 'react';
import { Package, Camera, Check, ArrowRight, X, Info } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Job, SelectedProduct } from '../../types';
import { ARCameraCapture } from '../ARModule/ARCameraCapture';

interface ProductSelectionProps {
  job: Job;
  onComplete: (data: { selectedProducts: SelectedProduct[] }) => void;
  onBack?: () => void;
}

export function ProductSelection({ job, onComplete, onBack }: ProductSelectionProps) {
  const { products, loading } = useData();
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(job.selectedProducts || []);
  const [showARCamera, setShowARCamera] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [detailProduct, setDetailProduct] = useState<any>(null);

  console.log('📦 ProductSelection: Products available:', products.length);
  console.log('📦 ProductSelection: Loading state:', loading);

  const handleProductSelect = (product: any) => {
    console.log('🛒 Adding product:', product.name);
    const existingProduct = selectedProducts.find(p => p.productId === product.id);

    if (existingProduct) {
      console.log('📈 Increasing quantity for:', product.name);
      setSelectedProducts(prev => prev.map(p =>
        p.productId === product.id
          ? { ...p, quantity: p.quantity + 1 }
          : p
      ));
    } else {
      console.log('✨ Adding new product:', product.name);
      const newSelectedProduct: SelectedProduct = {
        id: `selected-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        customerApproved: false,
        createdAt: new Date().toISOString()
      };

      setSelectedProducts(prev => [...prev, newSelectedProduct]);
    }
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
    } else {
      setSelectedProducts(prev => prev.map(p =>
        p.productId === productId ? { ...p, quantity: newQuantity } : p
      ));
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
  };

  const handleARDemo = (product: any) => {
    setCurrentProduct(product);
    setShowARCamera(true);
  };

  const handleARScreenshot = (screenshot: string) => {
    if (currentProduct) {
      setSelectedProducts(prev => prev.map(p => 
        p.productId === currentProduct.id 
          ? { ...p, arScreenshot: screenshot, customerApproved: true }
          : p
      ));
    }
    setShowARCamera(false);
  };

  const handleComplete = () => {
    onComplete({ selectedProducts });
  };

  const activeProducts = products.filter(p => p.isActive);

  // Get unique categories
  const categories = ['all', ...new Set(activeProducts.map(p => p.category))];

  // Filter products based on category and search term
  const filteredProducts = activeProducts.filter(product => {
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Selection</h3>
        <p className="text-gray-600">Show products to customer and demonstrate with AR</p>
      </div>

      {/* Filter and Search */}
      {!loading && activeProducts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or category..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Showing {filteredProducts.length} of {activeProducts.length} products
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      )}

      {/* No Products State */}
      {!loading && activeProducts.length === 0 && (
        <div className="text-center py-12 bg-yellow-50 rounded-lg border-2 border-yellow-200">
          <Package className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Products Available</h4>
          <p className="text-gray-600 mb-4">
            Please contact your administrator to add products to the system.
          </p>
          <button
            onClick={() => onComplete({ selectedProducts: [] })}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Skip Product Selection
          </button>
        </div>
      )}

      {/* Product Grid */}
      {!loading && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div
              onClick={() => {
                setDetailProduct(product);
                setShowProductDetail(true);
              }}
              className="cursor-pointer"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-32 object-cover rounded-lg mb-3 hover:opacity-90 transition-opacity"
              />
              <h4 className="font-medium text-gray-900 mb-1 hover:text-blue-600 transition-colors">{product.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{product.category}</p>
              <p className="text-lg font-bold text-blue-600 mb-3">${product.price}</p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleProductSelect(product)}
                className={`flex-1 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                  selectedProducts.some(p => p.productId === product.id)
                    ? 'bg-green-600 text-white shadow-lg transform scale-105'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Package className="w-4 h-4 mr-1 inline" />
                {selectedProducts.some(p => p.productId === product.id) ? 'Selected' : 'Select'}
              </button>
              <button
                onClick={() => handleARDemo(product)}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>
          ))}
        </div>
      )}

      {/* Selected Products */}
      {selectedProducts.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Selected Products ({selectedProducts.length})</h4>
          <div className="space-y-2">
            {selectedProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-600">${product.price} each</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-2 py-1">
                    <button
                      onClick={() => handleQuantityChange(product.productId, product.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{product.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(product.productId, product.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold"
                    >
                      +
                    </button>
                  </div>
                  {/* Status Icons */}
                  <div className="flex items-center space-x-2">
                    {product.arScreenshot && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        AR Demo
                      </span>
                    )}
                    {product.customerApproved && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveProduct(product.productId)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Remove product"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center font-semibold text-gray-900">
                <span>Total:</span>
                <span className="text-lg">
                  ${selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductDetail && detailProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Product Details</h3>
              <button
                onClick={() => {
                  setShowProductDetail(false);
                  setDetailProduct(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <img
                  src={detailProduct.image}
                  alt={detailProduct.name}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{detailProduct.name}</h4>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {detailProduct.category}
                  </span>
                </div>

                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-blue-600">${detailProduct.price}</span>
                  <span className="text-gray-500">per unit</span>
                </div>

                {detailProduct.description && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Description</h5>
                    <p className="text-gray-700 leading-relaxed">{detailProduct.description}</p>
                  </div>
                )}

                {detailProduct.specifications && detailProduct.specifications.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Specifications</h5>
                    <ul className="space-y-2">
                      {detailProduct.specifications.map((spec: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <Info className="w-4 h-4" />
                    <span>Status: {detailProduct.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  {detailProduct.model3d && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <Check className="w-4 h-4" />
                      <span>3D Model Available</span>
                    </div>
                  )}
                  {detailProduct.arModel && (
                    <div className="flex items-center space-x-2 text-sm text-purple-600">
                      <Camera className="w-4 h-4" />
                      <span>AR Ready</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    handleProductSelect(detailProduct);
                    setShowProductDetail(false);
                  }}
                  className={`flex-1 px-6 py-3 rounded-lg transition-all font-medium ${
                    selectedProducts.some(p => p.productId === detailProduct.id)
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Package className="w-5 h-5 mr-2 inline" />
                  {selectedProducts.some(p => p.productId === detailProduct.id) ? 'Selected' : 'Select Product'}
                </button>
                <button
                  onClick={() => {
                    handleARDemo(detailProduct);
                    setShowProductDetail(false);
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <Camera className="w-5 h-5 mr-2 inline" />
                  AR Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AR Camera Modal */}
      {showARCamera && currentProduct && (
        <ARCameraCapture
          title={`AR Demo: ${currentProduct.name}`}
          overlayImage={currentProduct.image}
          onCapture={handleARScreenshot}
          onClose={() => setShowARCamera(false)}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={handleComplete}
          disabled={selectedProducts.length === 0}
          className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${!onBack ? 'ml-auto' : ''}`}
        >
          Continue to Next Step
          <ArrowRight className="w-4 h-4 ml-2 inline" />
        </button>
      </div>
    </div>
  );
}