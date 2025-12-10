import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package, X, Download, Eye } from 'lucide-react';
import { database } from '../firebase';
import { ref, push, onValue, update, remove } from 'firebase/database';
import './Common.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Boiling House',
    stock: 0,
    price: '',
    description: '',
    minStock: 10,
    sku: ''
  });

  const categories = ['All', 'Boiling House', 'Material Handling', 'Process & Storage', 'Mill House', 'Spares', 'Turnkey Projects'];

  useEffect(() => {
    const productsRef = ref(database, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProducts(productList);
      } else {
        setProducts([]);
      }
    });
  }, []);

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const productData = {
        ...formData,
        stock: parseInt(formData.stock) || 0,
        minStock: parseInt(formData.minStock) || 10,
        status: parseInt(formData.stock) > parseInt(formData.minStock) ? 'In Stock' : 'Low Stock',
        sku: formData.sku || `SKU-${Date.now()}`
      };

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
      alert('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: product.price,
      description: product.description || '',
      minStock: product.minStock || 10,
      sku: product.sku || ''
    });
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

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Boiling House',
      stock: 0,
      price: '',
      description: '',
      minStock: 10,
      sku: ''
    });
    setEditingProduct(null);
    setShowModal(false);
  };

  const filteredProducts = products.filter(product => 
    (selectedCategory === 'All' || product.category === selectedCategory) &&
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())))
  );

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
          <button className="btn-secondary">
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
          <span className="date-range">All Time</span>
          <button className="filter-btn">Filters</button>
        </div>
      </div>

      {/* Modern Table */}
      <div className="modern-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="product-info">
                    <div className="product-avatar">
                      <Package size={20} />
                    </div>
                    <div>
                      <div className="product-name">{product.name}</div>
                      <div className="product-desc">{product.description || 'No description'}</div>
                    </div>
                  </div>
                </td>
                <td className="text-muted">{product.sku || 'N/A'}</td>
                <td>{product.category}</td>
                <td>
                  <span className="stock-badge">{product.stock} units</span>
                </td>
                <td className="price-cell">₹{product.price}</td>
                <td>
                  <span className={`status-pill ${product.status === 'In Stock' ? 'status-success' : 'status-warning'}`}>
                    {product.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons-modern">
                    <button className="action-icon-btn view" title="View">
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
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
              
              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    min="0"
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
                <button className="btn-cancel-modern" onClick={resetForm}>Cancel</button>
                <button className="btn-submit-modern" onClick={handleSubmit}>
                  {editingProduct ? 'Update Product' : 'Add Product'}
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
