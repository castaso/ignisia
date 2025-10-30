export const locationService = {
  getCurrentLocation: (): Promise<GeolocationCoordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation is not supported by your browser.'));
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(position.coords);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error("User denied the request for Geolocation."));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error("Location information is unavailable."));
              break;
            case error.TIMEOUT:
              reject(new Error("The request to get user location timed out."));
              break;
            default:
              reject(new Error("An unknown error occurred while fetching location."));
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  },

  getAddressFromCoordinates: async (latitude: number, longitude: number): Promise<string> => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        if (!response.ok) {
            throw new Error('Failed to fetch address from geocoding service.');
        }
        const data = await response.json();
        if (data && data.display_name) {
            return data.display_name;
        }
        return 'Address not found.';
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        throw new Error('Could not retrieve address for the current location.');
    }
  }
};