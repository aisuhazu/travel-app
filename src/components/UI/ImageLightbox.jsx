import { useState, useEffect } from 'react';
import { Modal, Button, Badge, Spinner } from 'react-bootstrap';

const ImageLightbox = ({ 
  show, 
  onHide, 
  images = [], 
  initialIndex = 0, 
  tripTitle = "Trip Gallery" 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (show) {
      setLoading(true);
      setImageError(false);
    }
  }, [show, currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleKeyPress = (e) => {
    if (!show) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
      case 'Escape':
        onHide();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [show]);

  const currentImage = images[currentIndex];

  if (!show || !currentImage) return null;

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="xl" 
      centered
      className="lightbox-modal"
      backdrop="static"
    >
      <Modal.Header className="border-0 pb-0">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>
            <h5 className="mb-0">{tripTitle}</h5>
            <small className="text-muted">
              {currentIndex + 1} of {images.length}
            </small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Badge bg="secondary">
              {currentIndex + 1}/{images.length}
            </Badge>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={onHide}
              className="ms-2"
            >
              <i className="bi bi-x-lg"></i>
            </Button>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-0 position-relative">
        {/* Loading Spinner */}
        {loading && (
          <div className="position-absolute top-50 start-50 translate-middle">
            <Spinner animation="border" variant="light" />
          </div>
        )}

        {/* Error State */}
        {imageError && (
          <div className="text-center p-5">
            <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
            <p className="text-muted mt-2">Failed to load image</p>
          </div>
        )}

        {/* Main Image */}
        <div className="position-relative" style={{ minHeight: '60vh' }}>
          <img
            src={currentImage.url}
            alt={currentImage.originalName || `Image ${currentIndex + 1}`}
            className="img-fluid w-100"
            style={{ 
              maxHeight: '80vh', 
              objectFit: 'contain',
              display: loading || imageError ? 'none' : 'block'
            }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setImageError(true);
            }}
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="dark"
                className="position-absolute top-50 start-0 translate-middle-y ms-3"
                style={{ opacity: 0.8, zIndex: 10 }}
                onClick={goToPrevious}
              >
                <i className="bi bi-chevron-left"></i>
              </Button>
              <Button
                variant="dark"
                className="position-absolute top-50 end-0 translate-middle-y me-3"
                style={{ opacity: 0.8, zIndex: 10 }}
                onClick={goToNext}
              >
                <i className="bi bi-chevron-right"></i>
              </Button>
            </>
          )}
        </div>

        {/* Image Info */}
        {currentImage.originalName && (
          <div className="p-3 bg-light border-top">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{currentImage.originalName}</strong>
                {currentImage.uploadedAt && (
                  <small className="text-muted d-block">
                    Uploaded: {new Date(currentImage.uploadedAt).toLocaleDateString()}
                  </small>
                )}
              </div>
              {currentImage.size && (
                <Badge bg="secondary">
                  {(currentImage.size / 1024 / 1024).toFixed(1)} MB
                </Badge>
              )}
            </div>
          </div>
        )}
      </Modal.Body>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <Modal.Footer className="border-0 pt-0">
          <div className="d-flex gap-2 overflow-auto w-100" style={{ maxHeight: '100px' }}>
            {images.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                className={`img-thumbnail cursor-pointer ${
                  index === currentIndex ? 'border-primary' : ''
                }`}
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  objectFit: 'cover',
                  cursor: 'pointer'
                }}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </Modal.Footer>
      )}

      <style jsx>{`
        .lightbox-modal .modal-dialog {
          max-width: 95vw;
        }
        .lightbox-modal .modal-content {
          background: #000;
          color: white;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </Modal>
  );
};

export default ImageLightbox;