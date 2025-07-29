import { useState, useEffect } from "react";
import { Modal, Form, Button, Alert, Row, Col, Tab, Tabs } from "react-bootstrap";
import { tripAPI } from "../../services/api";
import LocationSearch from '../Maps/LocationSearch';
import { geocodingService } from '../../services/geocoding';
import ImageUpload from '../UI/ImageUpload';
import GalleryUpload from '../UI/GalleryUpload';
import { useAuth } from '../../contexts/AuthContext';

const TripModal = ({ show, onHide, trip, onSave }) => {
  const { user } = useAuth();
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
    cover_image_path: '',
    gallery_images: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Add the missing handleChange function
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Rename this function to match what the ImageUpload component expects
  const handleCoverImageChange = (imageData) => {
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

  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      destination: locationData.address,
      coordinates: locationData.coordinates,
      country: locationData.country,
      countryCode: locationData.countryCode
    }));
  };

  const handleDestinationChange = async (value) => {
    setFormData(prev => ({
      ...prev,
      destination: value
    }));
    
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
        cover_image_path: trip.cover_image_path || "",
        gallery_images: trip.gallery_images || [] // Add this line
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
        cover_image_path: "",
        gallery_images: [] // Add this line
      });
    }
    setError("");
  }, [trip, show]);

  const handleGalleryChange = (images) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: images
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const tripData = {
        ...formData,
        // Safely handle gallery images - ensure it's always an array
        gallery_images: (formData.gallery_images || []).map(img => ({
          url: img.url,
          path: img.path,
          filename: img.filename,
          originalName: img.originalName,
          order: img.order,
          uploadedAt: img.uploadedAt
        }))
      };
  
      if (trip) {
        await tripAPI.updateTrip(trip.id, tripData);
      } else {
        await tripAPI.createTrip(tripData);
      }
      
      onSave();
    } catch (error) {
      console.error('Trip save error:', error); // Add logging for debugging
      setError(error.response?.data?.message || 'Failed to save trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl"> {/* Changed to xl for more space */}
      <Modal.Header closeButton>
        <Modal.Title>{trip ? "Edit Trip" : "Create New Trip"}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Tabs defaultActiveKey="details" className="mb-3">
            <Tab eventKey="details" title="Trip Details">
              {/* Existing form fields */}
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
            </Tab>

            <Tab eventKey="cover" title="Cover Photo">
              <ImageUpload
                currentImage={formData.cover_image}
                onImageUploaded={handleCoverImageChange}
                tripId={trip?.id || 'new'}
                userId={user?.uid}
                label="Trip Cover Photo"
                helpText="Choose a cover photo that represents your trip"
              />
            </Tab>

            <Tab eventKey="gallery" title="Photo Gallery">
              <GalleryUpload
                tripId={trip?.id || 'new'}
                userId={user?.uid}
                existingImages={formData.gallery_images}
                onImagesChange={handleGalleryChange}
                maxImages={20}
              />
            </Tab>
          </Tabs>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
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
      </Form>
    </Modal>
  );
};

export default TripModal;
