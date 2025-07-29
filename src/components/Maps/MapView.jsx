import { useState, useCallback } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { Spinner, Alert } from "react-bootstrap";
import useGoogleMaps from "../../hooks/useGoogleMaps";

// Add back the missing constants
const getResponsiveMapHeight = () => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth < 576) return "200px";  // Small phones
    if (window.innerWidth < 768) return "250px";  // Large phones
    if (window.innerWidth < 1024) return "300px"; // Tablets
    return "400px"; // Desktop
  }
  return "400px"; // Default fallback
};

// Function to get pin color based on trip status
const getPinColor = (status) => {
  const statusColors = {
    planned: "#0d6efd",    // Bootstrap primary (blue)
    ongoing: "#198754",    // Bootstrap success (green)
    completed: "#6c757d",  // Bootstrap secondary (gray)
  };
  return statusColors[status] || statusColors.planned;
};

// Function to determine trip status based on dates
const getTripStatus = (trip) => {
  if (trip.status) {
    return trip.status;
  }
  
  // Fallback logic based on dates if status is not set
  const today = new Date();
  const startDate = trip.start_date ? new Date(trip.start_date) : null;
  const endDate = trip.end_date ? new Date(trip.end_date) : null;
  
  if (startDate && endDate) {
    if (today < startDate) {
      return 'planned';
    } else if (today >= startDate && today <= endDate) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  }
  
  return 'planned'; // Default fallback
};

const containerStyle = {
  width: "100%",
  height: getResponsiveMapHeight(),
  borderRadius: "8px",
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006, // New York City as default
};

const MapView = ({
  trips = [],
  center = defaultCenter,
  zoom = 10,
  onMapClick,
  selectedTrip,
  height = "400px",
}) => {
  const [map, setMap] = useState(null);
  const [advancedMarkers, setAdvancedMarkers] = useState([]);

  const { isLoaded, loadError } = useGoogleMaps(); // Use the shared hook

  const onLoad = useCallback(
    async (map) => {
      setMap(map);

      // Load advanced markers library
      if (window.google?.maps?.importLibrary) {
        try {
          const { AdvancedMarkerElement, PinElement } =
            await window.google.maps.importLibrary("marker");

          // Clear existing markers
          advancedMarkers.forEach((marker) => {
            if (marker.map) {
              marker.map = null;
            }
          });

          // Create new advanced markers with status-based colors
          const newMarkers = trips
            .filter((trip) => trip.coordinates)
            .map((trip) => {
              const tripStatus = getTripStatus(trip);
              const pinColor = getPinColor(tripStatus);
              
              const pinElement = new PinElement({
                background: selectedTrip?.id === trip.id ? "#dc3545" : pinColor,
                borderColor: "#ffffff",
                glyphColor: "#ffffff",
                scale: selectedTrip?.id === trip.id ? 1.2 : 1.0, // Make selected trip slightly larger
              });

              return new AdvancedMarkerElement({
                map,
                position: trip.coordinates,
                title: `${trip.title} (${tripStatus})`,
                content: pinElement.element,
              });
            });

          setAdvancedMarkers(newMarkers);
        } catch (error) {
          console.warn(
            "Advanced markers not available, falling back to legacy markers",
            error
          );
        }
      }
    },
    [trips, selectedTrip, advancedMarkers]
  );

  const onUnmount = useCallback(() => {
    // Clean up advanced markers
    advancedMarkers.forEach((marker) => {
      if (marker.map) {
        marker.map = null;
      }
    });
    setAdvancedMarkers([]);
    setMap(null);
  }, [advancedMarkers]);

  const handleMapClick = useCallback(
    (event) => {
      if (onMapClick) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        onMapClick({ lat, lng });
      }
    },
    [onMapClick]
  );

  if (loadError) {
    return (
      <Alert variant="danger">
        Error loading Google Maps. Please check your API key and internet
        connection.
      </Alert>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading map...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ ...containerStyle, height }}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      options={{
        mapId: "DEMO_MAP_ID", // Required for advanced markers
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      {/* Advanced markers are handled in onLoad callback */}
    </GoogleMap>
  );
};

export default MapView;
