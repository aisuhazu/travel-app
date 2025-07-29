import { useState } from "react";
import { Card, Button, Badge, Dropdown } from "react-bootstrap";
import { tripAPI } from "../../services/api";
import { TripMap } from '../Maps';

const TripCard = ({ trip, onEdit, onRefresh }) => {
  const [loading, setLoading] = useState(false);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      planned: "primary",
      ongoing: "success",
      completed: "secondary",
    };
    return <Badge bg={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <Card className="h-100 shadow-sm">
      {trip.cover_image && (
        <Card.Img
          variant="top"
          src={trip.cover_image}
          style={{ height: "200px", objectFit: "cover" }}
          alt={trip.title}
        />
      )}

      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="mb-1">{trip.title}</Card.Title>
          <Dropdown>
            <Dropdown.Toggle
              variant="outline-secondary"
              size="sm"
              id={`dropdown-${trip.id}`}
            >
              <i className="bi bi-three-dots"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={onEdit}>
                <i className="bi bi-pencil me-2"></i>Edit
              </Dropdown.Item>
              <Dropdown.Item onClick={handleDelete} disabled={loading}>
                <i className="bi bi-trash me-2"></i>Delete
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div className="mb-2">
          <small className="text-muted">
            <i className="bi bi-geo-alt me-1"></i>
            {trip.destination}{" "}
            {/* Changed from trip.location to trip.destination */}
          </small>
        </div>

        <div className="mb-2">
          <small className="text-muted">
            <i className="bi bi-calendar me-1"></i>
            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
          </small>
        </div>

        <div className="mb-3">{getStatusBadge(trip.status)}</div>

        {trip.description && (
          <Card.Text className="text-muted small mb-3">
            {trip.description.length > 100
              ? `${trip.description.substring(0, 100)}...`
              : trip.description}
          </Card.Text>
        )}

        {/* Improved gallery preview with larger images */}
        {trip.gallery_images && trip.gallery_images.length > 0 && (
          <div className="mb-3">
            <small className="text-muted d-block mb-2">
              <i className="bi bi-images me-1"></i>
              {trip.gallery_images.length} photo{trip.gallery_images.length !== 1 ? 's' : ''}
            </small>
            <div className="d-flex gap-2" style={{ maxHeight: "100px", overflow: "hidden" }}>
              {trip.gallery_images.slice(0, 3).map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Gallery ${index + 1}`}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "2px solid #dee2e6",
                    cursor: "pointer",
                    transition: "transform 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                />              
              ))}
              {trip.gallery_images.length > 3 && (
                <div
                  className="d-flex align-items-center justify-content-center text-muted"
                  style={{
                    width: "100px",
                    height: "100px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    border: "2px solid #dee2e6",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  +{trip.gallery_images.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add map after gallery */}
        <div className="mt-3">
          <TripMap trip={trip} height="200px" />
        </div>

        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              <i className="bi bi-heart me-1"></i>
              {trip.likes_count || 0} likes
            </small>
            <small className="text-muted">
              <i className="bi bi-chat me-1"></i>
              {trip.comments_count || 0} comments
            </small>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TripCard;
