import { useState } from 'react';
import { Row, Col, Card, Badge, Button } from 'react-bootstrap';
import ImageLightbox from './ImageLightbox';

const ImageGalleryGrid = ({ 
  images = [], 
  title = "Photo Gallery", 
  showTitle = true,
  columns = { xs: 2, sm: 3, md: 4, lg: 6 },
  aspectRatio = '1',
  maxPreview = 12
}) => {
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const displayImages = showAll ? images : images.slice(0, maxPreview);
  const hasMore = images.length > maxPreview;

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  if (images.length === 0) {
    return (
      <Card className="text-center p-4">
        <i className="bi bi-images text-muted" style={{ fontSize: '3rem' }}></i>
        <p className="text-muted mt-2 mb-0">No images in gallery</p>
      </Card>
    );
  }

  return (
    <>
      {showTitle && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            <i className="bi bi-images me-2"></i>
            {title}
          </h5>
          <Badge bg="secondary">
            {images.length} {images.length === 1 ? 'image' : 'images'}
          </Badge>
        </div>
      )}

      <Row className="g-2">
        {displayImages.map((image, index) => (
          <Col 
            key={image.id || index} 
            xs={columns.xs} 
            sm={columns.sm} 
            md={columns.md} 
            lg={columns.lg}
          >
            <div 
              className="position-relative overflow-hidden rounded shadow-sm"
              style={{ cursor: 'pointer' }}
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.url}
                alt={image.originalName || `Gallery image ${index + 1}`}
                className="img-fluid w-100 hover-zoom"
                style={{ 
                  aspectRatio: aspectRatio, 
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease'
                }}
              />
              
              {/* Image overlay on hover */}
              <div className="image-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                <i className="bi bi-zoom-in text-white" style={{ fontSize: '1.5rem' }}></i>
              </div>
              
              {/* Image number badge */}
              <Badge 
                bg="dark" 
                className="position-absolute bottom-0 end-0 m-1"
                style={{ fontSize: '0.7rem' }}
              >
                {index + 1}
              </Badge>
            </div>
          </Col>
        ))}
      </Row>

      {/* Show More/Less Button */}
      {hasMore && (
        <div className="text-center mt-3">
          <Button 
            variant="outline-primary" 
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <i className="bi bi-chevron-up me-1"></i>
                Show Less
              </>
            ) : (
              <>
                <i className="bi bi-chevron-down me-1"></i>
                Show {images.length - maxPreview} More
              </>
            )}
          </Button>
        </div>
      )}

      {/* Lightbox */}
      <ImageLightbox
        show={showLightbox}
        onHide={() => setShowLightbox(false)}
        images={images}
        initialIndex={lightboxIndex}
        tripTitle={title}
      />

      <style jsx>{`
        .hover-zoom:hover {
          transform: scale(1.05);
        }
        
        .image-overlay {
          background: rgba(0, 0, 0, 0.5);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .position-relative:hover .image-overlay {
          opacity: 1;
        }
      `}</style>
    </>
  );
};

export default ImageGalleryGrid;