import React, { useState, useEffect } from 'react';
import { Image, Plus, Trash2, Upload, X } from 'lucide-react';
import { database, storage } from '../firebase';
import { ref, push, onValue, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import './Common.css';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newImage, setNewImage] = useState({
    title: '',
    description: '',
    category: 'products',
    file: null
  });

  const categories = ['All', 'Products', 'Projects', 'Facilities', 'Team'];

  useEffect(() => {
    const galleryRef = ref(database, 'gallery');
    onValue(galleryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const imageList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setImages(imageList);
      } else {
        setImages([]);
      }
    });
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setNewImage({ ...newImage, file: e.target.files[0] });
    }
  };

  const handleUpload = async () => {
    if (!newImage.file || !newImage.title) {
      alert('Please provide title and select an image');
      return;
    }

    setUploading(true);
    try {
      const imageRef = storageRef(storage, `gallery/${Date.now()}_${newImage.file.name}`);
      await uploadBytes(imageRef, newImage.file);
      const imageUrl = await getDownloadURL(imageRef);

      const galleryRef = ref(database, 'gallery');
      await push(galleryRef, {
        title: newImage.title,
        description: newImage.description,
        category: newImage.category,
        imageUrl: imageUrl,
        storagePath: imageRef.fullPath,
        uploadedAt: new Date().toISOString()
      });

      setNewImage({ title: '', description: '', category: 'products', file: null });
      setShowModal(false);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
    setUploading(false);
  };

  const handleDelete = async (image) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await remove(ref(database, `gallery/${image.id}`));
      if (image.storagePath) {
        await deleteObject(storageRef(storage, image.storagePath));
      }
      alert('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>
            <Image size={32} />
            Gallery Management
          </h1>
          <p className="page-subtitle">Manage project images and product photos</p>
        </div>
        <button className="primary-btn" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Upload Image
        </button>
      </div>

      {/* Category Filter */}
      <div className="category-filter scroll-reveal revealed" style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '10px 24px',
              border: selectedCategory === cat ? '2px solid #1a237e' : '1px solid #e0e0e0',
              background: selectedCategory === cat ? '#1a237e' : 'white',
              color: selectedCategory === cat ? 'white' : '#666',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: selectedCategory === cat ? '600' : '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {cat}
            <span style={{
              background: selectedCategory === cat ? 'rgba(255,255,255,0.2)' : '#f5f5f5',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              {cat === 'All' 
                ? images.length 
                : images.filter(img => img.category.toLowerCase() === cat.toLowerCase()).length}
            </span>
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {images
          .filter(image => selectedCategory === 'All' || image.category.toLowerCase() === selectedCategory.toLowerCase())
          .map((image) => (
          <div key={image.id} className="gallery-item">
            <img src={image.imageUrl} alt={image.title} />
            <div className="gallery-overlay">
              <h3>{image.title}</h3>
              <p>{image.description}</p>
              <span className="gallery-category">{image.category}</span>
              <button className="delete-btn" onClick={() => handleDelete(image)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {images.filter(image => selectedCategory === 'All' || image.category.toLowerCase() === selectedCategory.toLowerCase()).length === 0 && (
        <div className="empty-state">
          <Image size={64} />
          <h3>No images in this category</h3>
          <p>{selectedCategory === 'All' ? 'Upload your first image to get started' : `No images found in ${selectedCategory} category`}</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload New Image</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group-modern">
                <label>Title *</label>
                <input
                  type="text"
                  value={newImage.title}
                  onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                  placeholder="Enter image title"
                  className="input-modern"
                />
              </div>
              
              <div className="form-group-modern">
                <label>Description</label>
                <textarea
                  value={newImage.description}
                  onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                  placeholder="Enter image description"
                  rows="4"
                  className="input-modern"
                />
              </div>
              
              <div className="form-group-modern">
                <label>Category</label>
                <select
                  value={newImage.category}
                  onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
                  className="input-modern"
                >
                  <option value="products">Products</option>
                  <option value="projects">Projects</option>
                  <option value="facilities">Facilities</option>
                  <option value="team">Team</option>
                </select>
              </div>
              
              <div className="form-group-modern">
                <label>Image File *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="input-modern file-input"
                />
                {newImage.file && (
                  <p className="file-name">{newImage.file.name}</p>
                )}
              </div>
              
              <div className="modal-footer-modern">
                <button className="btn-cancel-modern" onClick={() => setShowModal(false)}>Cancel</button>
                <button
                  className="btn-submit-modern"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  <Upload size={18} />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
