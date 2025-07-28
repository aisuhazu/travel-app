import { useState, useRef, useEffect } from "react";
import { Form, ListGroup, Spinner } from "react-bootstrap";
import useGoogleMaps from "../../hooks/useGoogleMaps";

const LocationSearch = ({
  onLocationSelect,
  placeholder = "Search for a destination...",
  value = "",
  onChange,
}) => {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
  const searchTimeout = useRef(null);

  const { isLoaded, loadError } = useGoogleMaps();

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const searchPlaces = async (searchQuery) => {
    if (!searchQuery.trim() || !window.google?.maps?.places) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use the new AutocompleteSuggestion API
      const { AutocompleteSuggestion } = await window.google.maps.importLibrary("places");
      
      const request = {
        input: searchQuery,
        includedPrimaryTypes: ["locality", "administrative_area_level_1", "country"], // Focus on cities/regions
        language: "en",
        region: "US"
      };

      const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
      
      if (suggestions && suggestions.length > 0) {
        setPredictions(suggestions.slice(0, 5));
        setShowDropdown(true);
      } else {
        setPredictions([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error("Places search error:", error);
      setError("Search request failed");
      setPredictions([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setError(null);

    if (onChange) {
      onChange(newQuery);
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchPlaces(newQuery);
    }, 300);
  };

  const handlePlaceSelect = async (suggestion) => {
    const displayName = suggestion.placePrediction?.text?.text || suggestion.text?.text;
    setQuery(displayName);
    setShowDropdown(false);
    setPredictions([]);
    setError(null);

    if (onChange) {
      onChange(displayName);
    }

    try {
      // Use the new Place API to get details
      const { Place } = await window.google.maps.importLibrary("places");
      
      const place = new Place({
        id: suggestion.placePrediction?.placeId || suggestion.placeId,
        requestedLanguage: "en"
      });

      // Fetch place details
      await place.fetchFields({
        fields: ["displayName", "formattedAddress", "location"]
      });

      const locationData = {
        name: place.displayName,
        address: place.formattedAddress,
        coordinates: {
          lat: place.location.lat(),
          lng: place.location.lng(),
        },
        placeId: suggestion.placePrediction?.placeId || suggestion.placeId,
      };

      if (onLocationSelect) {
        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error("Place details error:", error);
      setError("Failed to get place details");
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  if (loadError) {
    return (
      <Form.Control
        type="text"
        placeholder="Location search unavailable"
        disabled
        className="border-danger"
      />
    );
  }

  if (!isLoaded) {
    return (
      <Form.Control
        type="text"
        placeholder="Loading location search..."
        disabled
      />
    );
  }

  return (
    <div className="position-relative">
      <Form.Control
        type="text"
        value={query}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={() => query && searchPlaces(query)}
        placeholder={placeholder}
        autoComplete="off"
        className={error ? "border-warning" : ""}
      />
      
      {error && (
        <small className="text-warning d-block mt-1">
          {error}
        </small>
      )}

      {isLoading && (
        <div className="position-absolute end-0 top-50 translate-middle-y me-3">
          <Spinner animation="border" size="sm" />
        </div>
      )}

      {showDropdown && predictions.length > 0 && (
        <ListGroup
          className="position-absolute w-100 mt-1"
          style={{ zIndex: 1000 }}
        >
          {predictions.map((suggestion, index) => {
            const displayName = suggestion.placePrediction?.text?.text || suggestion.text?.text;
            const secondaryText = suggestion.placePrediction?.structuredFormat?.secondaryText?.text || "";
            
            return (
              <ListGroup.Item
                key={suggestion.placePrediction?.placeId || index}
                action
                onClick={() => handlePlaceSelect(suggestion)}
                className="d-flex align-items-center"
              >
                <i className="bi bi-geo-alt me-2 text-muted"></i>
                <div>
                  <div className="fw-medium">{displayName}</div>
                  {secondaryText && (
                    <small className="text-muted">{secondaryText}</small>
                  )}
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      )}
    </div>
  );
};

export default LocationSearch;
