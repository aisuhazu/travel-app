// Geocoding service for converting addresses to coordinates
export class GeocodingService {
  constructor() {
    this.geocoder = null;
    this.isLoaded = false;
  }

  async initialize() {
    if (this.isLoaded) return;
    
    // Wait for Google Maps to be loaded
    while (!window.google?.maps?.Geocoder) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.geocoder = new window.google.maps.Geocoder();
    this.isLoaded = true;
  }

  // Add this new method to extract country from coordinates
  async getCountryFromCoordinates(lat, lng) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          // Extract country from address components
          const countryComponent = results[0].address_components.find(
            component => component.types.includes('country')
          );
          
          if (countryComponent) {
            resolve({
              country: countryComponent.long_name,
              countryCode: countryComponent.short_name,
              formattedAddress: results[0].formatted_address
            });
          } else {
            reject(new Error('Country not found in geocoding results'));
          }
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  }

  // Update the existing geocodeAddress method to include country
  async geocodeAddress(address) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          
          // Extract country information
          const countryComponent = results[0].address_components.find(
            component => component.types.includes('country')
          );
          
          resolve({
            coordinates: {
              lat: location.lat(),
              lng: location.lng()
            },
            formattedAddress: results[0].formatted_address,
            placeId: results[0].place_id,
            country: countryComponent?.long_name || null,
            countryCode: countryComponent?.short_name || null
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  async reverseGeocode(lat, lng) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve({
            address: results[0].formatted_address,
            placeId: results[0].place_id
          });
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  }
}

export const geocodingService = new GeocodingService();