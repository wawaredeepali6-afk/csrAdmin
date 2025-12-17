import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package, X, Download, Eye, Upload, Image as ImageIcon } from 'lucide-react';
import { database, storage } from '../firebase';
import { ref, push, onValue, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import './Common.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [stockFilter, setStockFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Boiling House',
    price: '',
    description: '',
    sku: '',
    image: '',
    stock: 0,
    minStock: 10
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['All', 'Boiling House', 'Material Handling', 'Process & Storage', 'Mill House', 'Spares', 'Turnkey Projects'];

  useEffect(() => {
    const productsRef = ref(database, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        
        // Remove duplicates based on SKU or name
        const uniqueProducts = productList.reduce((acc, current) => {
          const duplicate = acc.find(item => 
            item.sku === current.sku || 
            (item.name === current.name && item.category === current.category)
          );
          if (!duplicate) {
            return [...acc, current];
          }
          return acc;
        }, []);
        
        setProducts(uniqueProducts);
      } else {
        setProducts([]);
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!formData.name || !formData.price) {
      alert('Please fill in required fields');
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);

    try {
      let imageUrl = formData.image || '';

      // Upload image to Firebase Storage if new image is selected
      if (imageFile) {
        const timestamp = Date.now();
        const fileName = `products/${timestamp}_${imageFile.name}`;
        const imageRef = storageRef(storage, fileName);
        
        // Upload image
        await uploadBytes(imageRef, imageFile);
        
        // Get download URL
        imageUrl = await getDownloadURL(imageRef);
      }

      const stock = parseInt(formData.stock) || 0;
      const minStock = parseInt(formData.minStock) || 10;
      
      // Parse stock values properly
      const stockValue = formData.stock !== '' && formData.stock !== null && formData.stock !== undefined 
        ? parseInt(formData.stock) 
        : 0;
      const minStockValue = formData.minStock !== '' && formData.minStock !== null && formData.minStock !== undefined 
        ? parseInt(formData.minStock) 
        : 10;
      
      console.log('=== DEBUG INFO ===');
      console.log('Form Data:', formData);
      console.log('Stock Value:', stockValue, 'Type:', typeof stockValue);
      console.log('MinStock Value:', minStockValue, 'Type:', typeof minStockValue);
      
      const productData = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        description: formData.description || '',
        sku: formData.sku || `SKU-${Date.now()}`,
        image: imageUrl,
        stock: stockValue,
        minStock: minStockValue,
        status: stockValue > minStockValue ? 'In Stock' : 'Low Stock'
      };
      
      console.log('Product Data to save:', productData);
      console.log('==================');

      if (editingProduct) {
        await update(ref(database, `products/${editingProduct.id}`), {
          ...productData,
          updatedAt: new Date().toISOString()
        });
        alert('Product updated successfully!');
      } else {
        await push(ref(database, 'products'), {
          ...productData,
          createdAt: new Date().toISOString()
        });
        alert('Product added successfully!');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product: ' + error.message);
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description || '',
      sku: product.sku || '',
      image: product.image || '',
      stock: product.stock || 0,
      minStock: product.minStock || 10
    });
    setImagePreview(product.image || null);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await remove(ref(database, `products/${productId}`));
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      // Store file for upload
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setFormData({ ...formData, image: '' });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Boiling House',
      price: '',
      description: '',
      sku: '',
      image: '',
      stock: 0,
      minStock: 10
    });
    setImagePreview(null);
    setImageFile(null);
    setEditingProduct(null);
    setShowModal(false);
  };

  const handleView = (product) => {
    setViewingProduct(product);
    setShowViewModal(true);
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Product Name', 'SKU', 'Category', 'Stock', 'Price', 'Status', 'Description'];
    const csvData = filteredProducts.map(product => [
      product.name,
      product.sku || 'N/A',
      product.category,
      product.stock,
      product.price,
      product.status,
      product.description || ''
    ]);

    // Combine headers and data
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'in-stock' && product.status === 'In Stock') ||
                        (stockFilter === 'low-stock' && product.status === 'Low Stock');
    
    return matchesCategory && matchesSearch && matchesStock;
  });

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.status === 'In Stock').length,
    lowStock: products.filter(p => p.status === 'Low Stock').length
  };

  return (
    <div className="modern-page-container">
      {/* Header Section */}
      <div className="modern-header">
        <div className="header-left">
          <div className="page-icon">
            <Package size={24} />
          </div>
          <div>
            <h1>Products</h1>
            <p className="subtitle">View all of your Product information</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={18} />
            Export
          </button>
          <button className="btn-primary-modern" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Add New
          </button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="tabs-container">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
            <span className="tab-count">
              {cat === 'All' ? products.length : products.filter(p => p.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="search-filter-bar">
        <div className="search-input-modern">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search for Products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <select 
            className="date-range"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="all">All Products</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
          </select>
          <button 
            className="filter-btn"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            Filters {showFilterMenu ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Filter Menu */}
      {showFilterMenu && (
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>Filter by Stock Status</h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setStockFilter('all')}
              style={{
                padding: '8px 16px',
                border: stockFilter === 'all' ? '2px solid #6c5ce7' : '1px solid #e0e0e0',
                background: stockFilter === 'all' ? '#f0edff' : 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              All Products ({products.length})
            </button>
            <button 
              onClick={() => setStockFilter('in-stock')}
              style={{
                padding: '8px 16px',
                border: stockFilter === 'in-stock' ? '2px solid #4caf50' : '1px solid #e0e0e0',
                background: stockFilter === 'in-stock' ? '#e8f5e9' : 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              In Stock ({stats.inStock})
            </button>
            <button 
              onClick={() => setStockFilter('low-stock')}
              style={{
                padding: '8px 16px',
                border: stockFilter === 'low-stock' ? '2px solid #ff9800' : '1px solid #e0e0e0',
                background: stockFilter === 'low-stock' ? '#fff3e0' : 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              Low Stock ({stats.lowStock})
            </button>
          </div>
        </div>
      )}

      {/* Modern Table */}
      <div className="modern-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Min Stock</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td data-label="Product">
                  <div className="product-info">
                    <div className="product-avatar">
                      <Package size={20} />
                    </div>
                    <div>
                      <div className="product-name">{product.name}</div>
                      <div className="product-desc">
                        {product.description 
                          ? (product.description.length > 50 
                              ? product.description.substring(0, 50) + '...' 
                              : product.description)
                          : 'No description'}
                      </div>
                    </div>
                  </div>
                </td>
                <td data-label="SKU" className="text-muted">{product.sku || 'N/A'}</td>
                <td data-label="Category">{product.category}</td>
                <td data-label="Stock">
                  <span className="stock-badge">
                    {typeof product.stock !== 'undefined' ? product.stock : 0} units
                  </span>
                </td>
                <td data-label="Min Stock">
                  <span className="stock-badge" style={{ background: '#fff3e0', color: '#ff9800' }}>
                    {typeof product.minStock !== 'undefined' ? product.minStock : 10} units
                  </span>
                </td>
                <td data-label="Price" className="price-cell">₹{product.price}</td>
                <td data-label="Status">
                  <span className={`status-pill ${product.status === 'In Stock' ? 'status-success' : 'status-warning'}`}>
                    {product.status || 'In Stock'}
                  </span>
                </td>
                <td data-label="Actions">
                  <div className="action-buttons-modern">
                    <button className="action-icon-btn view" onClick={() => handleView(product)} title="View">
                      <Eye size={16} />
                    </button>
                    <button className="action-icon-btn edit" onClick={() => handleEdit(product)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="action-icon-btn delete" onClick={() => handleDelete(product.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="empty-state-modern">
            <Package size={64} />
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && viewingProduct && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Product Details</h2>
              <button onClick={() => setShowViewModal(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="view-details-grid">
                <div className="view-detail-item">
                  <label>Product Name</label>
                  <p>{viewingProduct.name}</p>
                </div>
                <div className="view-detail-item">
                  <label>SKU</label>
                  <p>{viewingProduct.sku || 'N/A'}</p>
                </div>
                <div className="view-detail-item">
                  <label>Category</label>
                  <p>{viewingProduct.category}</p>
                </div>
                <div className="view-detail-item">
                  <label>Price</label>
                  <p className="price-text">₹{viewingProduct.price}</p>
                </div>
                <div className="view-detail-item">
                  <label>Stock Quantity</label>
                  <p>{viewingProduct.stock} units</p>
                </div>
                <div className="view-detail-item">
                  <label>Minimum Stock</label>
                  <p>{viewingProduct.minStock} units</p>
                </div>
                <div className="view-detail-item">
                  <label>Status</label>
                  <p>
                    <span className={`status-pill ${viewingProduct.status === 'In Stock' ? 'status-success' : 'status-warning'}`}>
                      {viewingProduct.status}
                    </span>
                  </p>
                </div>
                <div className="view-detail-item full-width">
                  <label>Description</label>
                  <p>{viewingProduct.description || 'No description available'}</p>
                </div>
              </div>
              <div className="modal-footer-modern">
                <button className="btn-cancel-modern" onClick={() => setShowViewModal(false)}>Close</button>
                <button className="btn-submit-modern" onClick={() => {
                  setShowViewModal(false);
                  handleEdit(viewingProduct);
                }}>
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') {
            resetForm();
          }
        }}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={resetForm} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group-modern">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  className="input-modern"
                />
              </div>
              
              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-modern"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group-modern">
                  <label>Price (₹) *</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g., 2,50,000"
                    className="input-modern"
                  />
                </div>
              </div>
              
              <div className="form-group-modern">
                <label>Product Image</label>
                <div style={{ 
                  border: '2px dashed #e0e0e0', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  textAlign: 'center',
                  background: '#fafafa',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) {
                    handleImageChange({ target: { files: [file] } });
                  }
                }}
                >
                  {imagePreview ? (
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px', 
                          borderRadius: '8px',
                          objectFit: 'contain'
                        }} 
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer', display: 'block' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                      <div style={{ color: '#666' }}>
                        <Upload size={40} style={{ margin: '0 auto 12px', display: 'block', color: '#1a237e' }} />
                        <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>Click to upload or drag and drop</p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
              
              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    min="0"
                    placeholder="Enter stock quantity"
                    className="input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Minimum Stock Level</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    min="0"
                    placeholder="Enter minimum stock"
                    className="input-modern"
                  />
                </div>
              </div>
              
              <div className="form-group-modern">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                  rows="4"
                  className="input-modern"
                />
              </div>
              
              <div className="modal-footer-modern">
                <button 
                  type="button"
                  className="btn-cancel-modern" 
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="btn-submit-modern" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{ 
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    pointerEvents: isSubmitting ? 'none' : 'auto'
                  }}
                >
                  {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
