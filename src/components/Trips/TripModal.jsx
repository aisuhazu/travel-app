import { useState, useEffect } from "react";
import { Modal, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { tripAPI } from "../../services/api";
import LocationSearch from '../Maps/LocationSearch';
import { geocodingService } from '../../services/geocoding';

const TripModal = ({ show, onHide, trip, onSave }) => {
  // Update the formData state to include coordinates
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    coordinates: null, // Add this
    start_date: '',
    end_date: '',
    status: 'planned',
    budget: '',
    cover_image: ''
  });
  
  // Add this function to handle location selection
  // Update the handleLocationSelect function
  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      destination: locationData.address,
      coordinates: locationData.coordinates,
      country: locationData.country,
      countryCode: locationData.countryCode
    }));
  };
  
  // Update handleDestinationChange
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
    };
  };
  
  // Replace the destination Form.Group with this:
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (trip) {
      setFormData({
        title: trip.title || "",
        description: trip.description || "",
        destination: trip.destination || "", // Changed from 'location' to 'destination'
        start_date: trip.start_date ? trip.start_date.split("T")[0] : "",
        end_date: trip.end_date ? trip.end_date.split("T")[0] : "",
        status: trip.status || "planned",
        budget: trip.budget || "",
        cover_image: trip.cover_image || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        destination: "", // Changed from 'location' to 'destination'
        start_date: "",
        end_date: "",
        status: "planned",
        budget: "",
        cover_image: "",
      });
    }
    setError("");
  }, [trip, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }
      // Fix the validation (around line 60)
      if (!formData.destination.trim()) {
        throw new Error("Destination is required"); // Changed from formData.location.trim()
      }
      if (!formData.start_date) {
        throw new Error("Start date is required");
      }
      if (!formData.end_date) {
        throw new Error("End date is required");
      }
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        throw new Error("End date must be after start date");
      }

      const tripData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      };

      if (trip) {
        await tripAPI.updateTrip(trip.id, tripData);
      } else {
        await tripAPI.createTrip(tripData);
      }

      onSave();
    } catch (error) {
      console.error("Error saving trip:", error);
      setError(
        error.response?.data?.message || error.message || "Failed to save trip"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{trip ? "Edit Trip" : "Create New Trip"}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

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
                <Form.Label>Start Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
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
                <Form.Label>Budget (Optional)</Form.Label>
                <Form.Control
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="Enter budget amount"
                  min="0"
                  step="0.01"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Cover Image URL (Optional)</Form.Label>
            <Form.Control
              type="url"
              name="cover_image"
              value={formData.cover_image}
              onChange={handleChange}
              placeholder="Enter image URL"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your trip..."
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : trip ? "Update Trip" : "Create Trip"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TripModal;
