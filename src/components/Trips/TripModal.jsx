import { useState, useEffect } from "react";
import { Modal, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { tripAPI } from "../../services/api";
import LocationSearch from '../Maps/LocationSearch';
import { geocodingService } from '../../services/geocoding';
import ImageUpload from '../UI/ImageUpload';

const TripModal = ({ show, onHide, trip, onSave }) => {
  // Update the formData state to include cover image
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    coordinates: null,
    start_date: '',
    end_date: '',
    status: 'planned',
    budget: '',
    cover_image: '',
    cover_image_path: '' // Add this for Firebase Storage path
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Add function to handle cover image upload
  const handleCoverImageUploaded = (imageData) => {
    if (imageData) {
      setFormData(prev => ({
        ...prev,
        cover_image: imageData.url,
        cover_image_path: imageData.path
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        cover_image: '',
        cover_image_path: ''
      }));
    }
  };
  
  // Add this function to handle location selection
  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      destination: locationData.address,
      coordinates: locationData.coordinates,
      country: locationData.country,
      countryCode: locationData.countryCode
    }));
  };
  
  // Add this function to handle manual destination input
  const handleDestinationChange = async (value) => {
    setFormData(prev => ({
      ...prev,
      destination: value
    }));
    
    // If user types manually, try to geocode after a delay
    if (value.length > 3) {
      try {
        const result = await geocodingService.geocodeAddress(value);
        setFormData(prev => ({
          ...prev,
          coordinates: result.coordinates,
          country: result.country,
          countryCode: result.countryCode
        }));
      } catch (error) {
        // Silent fail - coordinates will be null
        console.log('Could not geocode address:', error);
      }
    }
  };

  useEffect(() => {
    if (trip) {
      setFormData({
        title: trip.title || "",
        description: trip.description || "",
        destination: trip.destination || "",
        coordinates: trip.coordinates || null,
        start_date: trip.start_date ? trip.start_date.split("T")[0] : "",
        end_date: trip.end_date ? trip.end_date.split("T")[0] : "",
        status: trip.status || "planned",
        budget: trip.budget || "",
        cover_image: trip.cover_image || "",
        cover_image_path: trip.cover_image_path || ""
      });
    } else {
      setFormData({
        title: "",
        description: "",
        destination: "",
        coordinates: null,
        start_date: "",
        end_date: "",
        status: "planned",
        budget: "",
        cover_image: "",
        cover_image_path: ""
      });
    }
    setError("");
  }, [trip, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    
    if (!formData.destination.trim()) {
      setError("Destination is required");
      return;
    }
    
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      setError("End date must be after start date");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const tripData = {
        ...formData,
        latitude: formData.coordinates?.lat || null,
        longitude: formData.coordinates?.lng || null
      };
      
      if (trip) {
        await tripAPI.updateTrip(trip.id, tripData);
      } else {
        await tripAPI.createTrip(tripData);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving trip:', error);
      setError('Failed to save trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {trip ? 'Edit Trip' : 'Create New Trip'}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Cover Photo Section */}
            <Col md={12} className="mb-4">
              <Form.Label className="fw-bold">Cover Photo</Form.Label>
              <ImageUpload
                onImageUploaded={handleCoverImageUploaded}
                currentImage={formData.cover_image}
                tripId={trip?.id}
              />
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Title *</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter trip title"
                  required
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Destination *</Form.Label>
                <LocationSearch
                  value={formData.destination}
                  onChange={handleDestinationChange}
                  onLocationSelect={handleLocationSelect}
                  placeholder="Search for a destination..."
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="planned">Planned</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Budget</Form.Label>
                <Form.Control
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="Enter budget (optional)"
                  min="0"
                  step="0.01"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your trip..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              {trip ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            trip ? 'Update Trip' : 'Create Trip'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TripModal;
