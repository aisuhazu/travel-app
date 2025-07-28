import React from "react";
import MapView from "./MapView";
import { Card } from "react-bootstrap";

const TripMap = ({ trip, height = "300px" }) => {
  if (!trip) {
    return (
      <Card>
        <Card.Body>
          <Card.Text className="text-muted text-center">
            No trip selected
          </Card.Text>
        </Card.Body>
      </Card>
    );
  }

  // Default coordinates (we'll enhance this with geocoding later)
  const defaultCoordinates = {
    lat: 40.7128,
    lng: -74.006,
  };

  const tripWithCoordinates = {
    ...trip,
    coordinates: trip.coordinates || defaultCoordinates,
  };

  return (
    <Card>
      <Card.Header>
        <h6 className="mb-0">
          <i className="bi bi-geo-alt me-2"></i>
          {trip.destination}
        </h6>
      </Card.Header>
      <Card.Body className="p-0">
        <MapView
          trips={[tripWithCoordinates]}
          center={tripWithCoordinates.coordinates}
          zoom={12}
          height={height}
          selectedTrip={trip}
        />
      </Card.Body>
    </Card>
  );
};

export default TripMap;
