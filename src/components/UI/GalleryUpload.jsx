import { useState, useRef } from 'react';
import { Card, Button, Alert, ProgressBar, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { imageUploadService } from '../../services/imageUpload';

const GalleryUpload = ({ tripId, userId, existingImages = [], onImagesChange, maxImages = 20 }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - existingImages.length;
    
    if (fileArray.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more images (${maxImages} max per trip)`);
      return;
    }

    uploadImages(fileArray);
  };

  const uploadImages = async (files) => {
    try {
      setUploading(true);
      setError('');
      setUploadProgress({ current: 0, total: files.length });

      const uploadedImages = await imageUploadService.uploadMultipleImages(
        files,
        tripId,
        userId,
        (current, total) => setUploadProgress({ current, total })
      );

      // Add order indices based on existing images
      const newImages = uploadedImages.map((image, index) => ({
        ...image,
        order: existingImages.length + index,
        id: `temp_${Date.now()}_${index}` // Temporary ID until saved to backend
      }));

      onImagesChange([...existingImages, ...newImages]);
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = async (imageIndex) => {
    const imageToRemove = existingImages[imageIndex];
    
    try {
      // Delete from Firebase Storage
      if (imageToRemove.path) {
        await imageUploadService.deleteImage(imageToRemove.path);
      }
      
      // Remove from local state
      const updatedImages = existingImages.filter((_, index) => index !== imageIndex);
      onImagesChange(updatedImages);
    } catch (error) {
      setError(`Failed to delete image: ${error.message}`);
    }
  };

  return (
    <Card className="mb-3">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <i className="bi bi-images me-2"></i>
            Photo Gallery
          </h6>
          <Badge bg="secondary">
            {existingImages.length}/{maxImages}
          </Badge>
        </div>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded p-4 text-center mb-3 ${
            dragOver ? 'border-primary bg-light' : 'border-secondary'
          } ${uploading ? 'opacity-50' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <div>
              <Spinner animation="border" size="sm" className="mb-2" />
              <p className="mb-2">Uploading images...</p>
              <ProgressBar 
                now={(uploadProgress.current / uploadProgress.total) * 100} 
                label={`${uploadProgress.current}/${uploadProgress.total}`}
              />
            </div>
          ) : (
            <div>
              <i className="bi bi-cloud-upload fs-1 text-muted mb-2 d-block"></i>
              <p className="mb-2">Drag & drop images here or click to browse</p>
              <small className="text-muted">
                Supports: JPG, PNG, WebP • Max 5MB per image • Up to {maxImages - existingImages.length} more images
              </small>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={uploading}
        />

        {/* Image Gallery Preview */}
        {existingImages.length > 0 && (
          <div>
            <h6 className="mb-3">Uploaded Images ({existingImages.length})</h6>
            <Row>
              {existingImages.map((image, index) => (
                <Col xs={6} md={4} lg={3} key={image.id || index} className="mb-3">
                  <div className="position-relative">
                    <img
                      src={image.url}
                      alt={`Gallery ${index + 1}`}
                      className="img-fluid rounded"
                      style={{ 
                        aspectRatio: '1', 
                        objectFit: 'cover', 
                        width: '100%'
                      }}
                      onError={(e) => {
                        console.error('Image failed to load:', image.url);
                        e.target.style.display = 'none';
                        // Show error placeholder
                        const errorDiv = e.target.parentElement.querySelector('.error-placeholder');
                        if (errorDiv) {
                          errorDiv.style.display = 'flex';
                          errorDiv.style.setProperty('display', 'flex', 'important');
                        }
                      }}
                      onLoad={(e) => {
                        console.log('Image loaded successfully:', image.url);
                        // Hide error placeholder
                        const errorDiv = e.target.parentElement.querySelector('.error-placeholder');
                        if (errorDiv) {
                          errorDiv.style.setProperty('display', 'none', 'important');
                        }
                      }}
                    />
                    {/* Error placeholder */}
                    <div 
                      className="error-placeholder align-items-center justify-content-center bg-light rounded"
                      style={{ 
                        aspectRatio: '1', 
                        width: '100%', 
                        display: 'none !important', // Use !important to override Bootstrap
                        fontSize: '0.8rem',
                        color: '#666',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 1
                      }}
                    >
                      <div className="text-center">
                        <i className="bi bi-exclamation-triangle d-block mb-1"></i>
                        Failed to load
                      </div>
                    </div>
                    
                    {/* Delete button */}
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-1"
                      onClick={() => removeImage(index)}
                      style={{ zIndex: 2 }}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default GalleryUpload;