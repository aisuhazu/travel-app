import { useJsApiLoader } from "@react-google-maps/api";

// Centralized libraries configuration
const LIBRARIES = ["places", "marker"];

const useGoogleMaps = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script", // Single consistent ID
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES, // Include all needed libraries
  });

  return { isLoaded, loadError };
};

export default useGoogleMaps;