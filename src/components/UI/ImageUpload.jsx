import { useState, useRef } from 'react';
import { Card, Button, Alert, Spinner, Image } from 'react-bootstrap';
import { imageUploadService } from '../../services/imageUpload';
import { useAuth } from '../../contexts/AuthContext';

const ImageUpload = ({ onImageUploaded, currentImage, tripId, className = '' }) => {
  const { currentUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentImage || null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setError('');
      setUploading(true);

      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Upload to Firebase
      const imagePath = imageUploadService.generateImagePath(
        currentUser.uid,
        tripId || 'temp',
        file.name
      );

      const result = await imageUploadService.uploadImage(file, imagePath);
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
      
      // Update preview with actual uploaded image
      setPreview(result.url);
      
      // Notify parent component
      onImageUploaded(result);
      
    } catch (error) {
      setError(error.message);
      setPreview(currentImage); // Revert to original
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUploaded(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
      />
      
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      <Card className="text-center">
        <Card.Body>
          {preview ? (
            <div>
              <Image
                src={preview}
                alt="Cover preview"
                fluid
                rounded
                style={{ maxHeight: '200px', objectFit: 'cover' }}
                className="mb-3"
              />
              <div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="me-2"
                >
                  {uploading ? (
                    <>
                      <Spinner size="sm" className="me-1" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-camera me-1"></i>
                      Change Photo
                    </>
                  )}
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={uploading}
                >
                  <i className="bi bi-trash me-1"></i>
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <i className="bi bi-camera display-4 text-muted mb-3 d-block"></i>
              <h6 className="text-muted mb-3">Add Cover Photo</h6>
              <Button
                variant="outline-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Spinner size="sm" className="me-1" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-1"></i>
                    Choose Photo
                  </>
                )}
              </Button>
              <div className="mt-2">
                <small className="text-muted">
                  JPG, PNG, or WebP • Max 5MB
                </small>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ImageUpload;