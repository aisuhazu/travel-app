import { useState, useCallback } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { Spinner, Alert } from "react-bootstrap";
import useGoogleMaps from "../../hooks/useGoogleMaps";

// Add back the missing constants
const containerStyle = {
  width: "100%",
  height: "400px",
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

          // Create new advanced markers
          const newMarkers = trips
            .filter((trip) => trip.coordinates)
            .map((trip) => {
              const pinElement = new PinElement({
                background:
                  selectedTrip?.id === trip.id ? "#dc3545" : "#0d6efd",
                borderColor: "#ffffff",
                glyphColor: "#ffffff",
              });

              return new AdvancedMarkerElement({
                map,
                position: trip.coordinates,
                title: trip.title,
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
