import { useState } from "react";
import { Card, Button, Badge, Dropdown, Row, Col } from "react-bootstrap";
import { tripAPI } from "../../services/api";
import { TripMap } from '../Maps';
import ImageLightbox from '../UI/ImageLightbox';

const TripCard = ({ trip, onEdit, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      try {
        setLoading(true);
        await tripAPI.deleteTrip(trip.id);
        onRefresh();
      } catch (error) {
        console.error("Error deleting trip:", error);
        alert("Failed to delete trip. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const openLightbox = (index = 0) => {
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ongoing': return 'warning';
      case 'planned': return 'primary';
      default: return 'secondary';
    }
  };

  const galleryImages = trip.gallery_images || [];
  const hasGallery = galleryImages.length > 0;
  const hasCoverImage = trip.cover_image;

  return (
    <>
      <Card className="h-100 shadow-sm trip-card">
        {/* Image Section */}
        <div className="position-relative">
          {hasCoverImage ? (
            <Card.Img 
              variant="top" 
              src={trip.cover_image} 
              style={{ height: '200px', objectFit: 'cover', cursor: hasGallery ? 'pointer' : 'default' }}
              onClick={() => hasGallery && openLightbox(0)}
            />
          ) : (
            <div 
              className="d-flex align-items-center justify-content-center text-center p-4"
              style={{ 
                height: '120px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <div>
                <i className="bi bi-geo-alt" style={{ fontSize: '2.5rem', marginBottom: '8px' }}></i>
                <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                  {trip.destination || 'Travel Destination'}
                </div>
              </div>
            </div>
          )}
          
          {/* Gallery Badge */}
          {hasGallery && (
            <Badge 
              bg="dark" 
              className="position-absolute top-0 end-0 m-2"
              style={{ cursor: 'pointer' }}
              onClick={() => openLightbox(0)}
            >
              <i className="bi bi-images me-1"></i>
              {galleryImages.length}
            </Badge>
          )}
          
          {/* Status Badge */}
          <Badge 
            bg={getStatusVariant(trip.status)} 
            className="position-absolute top-0 start-0 m-2"
          >
            {trip.status}
          </Badge>
        </div>

        <Card.Body className="d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <Card.Title className="mb-0 flex-grow-1">{trip.title}</Card.Title>
            <Dropdown>
              <Dropdown.Toggle 
                variant="outline-secondary" 
                size="sm" 
                className="border-0"
              >
                <i className="bi bi-three-dots-vertical"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" className="shadow">
                <Dropdown.Item onClick={() => onEdit(trip)}>
                  <i className="bi bi-pencil me-2"></i>Edit
                </Dropdown.Item>
                {hasGallery && (
                  <Dropdown.Item onClick={() => openLightbox(0)}>
                    <i className="bi bi-images me-2"></i>View Gallery
                  </Dropdown.Item>
                )}
                <Dropdown.Divider />
                <Dropdown.Item 
                  onClick={handleDelete} 
                  className="text-danger"
                  disabled={loading}
                >
                  <i className="bi bi-trash me-2"></i>Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <div className="mb-2">
            <small className="text-muted">
              <i className="bi bi-geo-alt me-1"></i>
              {trip.destination}
            </small>
            {trip.country && (
              <Badge bg="light" text="dark" className="ms-2">
                {trip.country}
              </Badge>
            )}
          </div>

          <div className="mb-2">
            <small className="text-muted">
              <i className="bi bi-calendar me-1"></i>
              {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
            </small>
          </div>

          {trip.description && (
            <Card.Text className="text-muted small mb-3">
              {trip.description.length > 100 
                ? `${trip.description.substring(0, 100)}...` 
                : trip.description
              }
            </Card.Text>
          )}

          {/* Gallery Preview */}
          {hasGallery && (
            <div className="mb-3">
              <small className="text-muted d-block mb-2">
                <i className="bi bi-images me-1"></i>
                Gallery Preview
              </small>
              <Row className="g-1">
                {galleryImages.slice(0, 4).map((image, index) => (
                  <Col xs={3} key={index}>
                    <img
                      src={image.url}
                      alt={`Gallery ${index + 1}`}
                      className="img-fluid rounded"
                      style={{ 
                        aspectRatio: '1', 
                        objectFit: 'cover', 
                        cursor: 'pointer',
                        width: '100%'
                      }}
                      onClick={() => openLightbox(index)}
                    />
                  </Col>
                ))}
                {galleryImages.length > 4 && (
                  <Col xs={3}>
                    <div 
                      className="bg-dark text-white d-flex align-items-center justify-content-center rounded"
                      style={{ 
                        aspectRatio: '1', 
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                      onClick={() => openLightbox(4)}
                    >
                      +{galleryImages.length - 4}
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          )}

          {/* Map Section */}
          {trip.coordinates && trip.coordinates.lat && trip.coordinates.lng && (
            <div className="mb-3">
              <small className="text-muted d-block mb-2">
                <i className="bi bi-map me-1"></i>
                Location
              </small>
              <div style={{ height: '250px', borderRadius: '8px', overflow: 'hidden' }}>
                <TripMap 
                  trip={trip}
                  height="250px"
                />
              </div>
            </div>
          )}

          {/* Budget */}
          {trip.budget && (
            <div className="mb-2">
              <small className="text-muted">
                <i className="bi bi-currency-dollar me-1"></i>
                Budget: ${trip.budget}
              </small>
            </div>
          )}

          <div className="mt-auto d-flex justify-content-between align-items-center">
            {/* Left side - View Gallery */}
            <div>
              {hasGallery && (
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => openLightbox(0)}
                >
                  <i className="bi bi-images me-1"></i>
                  View Gallery
                </Button>
              )}
            </div>
            
            {/* Right side - Edit and Delete */}
            <div>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => onEdit(trip)}
                className="me-2"
              >
                <i className="bi bi-pencil me-1"></i>
                Edit
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={handleDelete}
                disabled={loading}
              >
                <i className="bi bi-trash me-1"></i>
                Delete
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Lightbox Modal */}
      <ImageLightbox
        show={showLightbox}
        onHide={() => setShowLightbox(false)}
        images={galleryImages}
        initialIndex={lightboxIndex}
        tripTitle={trip.title}
      />

      <style jsx>{`
        .trip-card {
          transition: transform 0.2s ease-in-out;
        }
        .trip-card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </>
  );
};

export default TripCard;
