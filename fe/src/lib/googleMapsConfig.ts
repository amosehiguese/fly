import { Libraries } from '@react-google-maps/api';

// Define libraries with proper typing
const libraries: Libraries = ["places", "geometry"];

// Shared Google Maps configuration to ensure consistent loading across components
export const googleMapsConfig = {
  id: "google-map-script",
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
  // Include all libraries needed by any component
  libraries,
  language: "en",
  region: "US",
};
