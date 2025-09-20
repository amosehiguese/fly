import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useCallback, useState } from "react";
import { googleMapsConfig } from "@/lib/googleMapsConfig";

// Default center (fallback position - Stockholm coordinates)
const defaultCenter = {
  lat: 59.334591,
  lng: 18.06324,
};

type GoogleMapType = google.maps.Map | null;

// Accept userLocation as a prop
export const GoogleMapView = ({
  children,
  userLocation,
}: {
  children: React.ReactNode;
  userLocation?: { lat: number; lng: number };
}) => {
  // We need map state to manage the Google Map instance
  const [, setMap] = useState<GoogleMapType>(null);

  const { isLoaded, loadError } = useJsApiLoader(googleMapsConfig);

  // Center on userLocation if provided, else fallback
  const center = userLocation || defaultCenter;

  const onLoad = useCallback(
    function callback(map: GoogleMapType) {
      if (userLocation) {
        const userLatLng = new window.google.maps.LatLng(
          userLocation.lat,
          userLocation.lng
        );
        map?.setCenter(userLatLng);
      } else {
        const bounds = new window.google.maps.LatLngBounds(defaultCenter);
        map?.fitBounds(bounds);
      }
      setMap(map);
    },
    [userLocation]
  );

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // Handle loading state
  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-gray-100 flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-t-blue-500 border-b-gray-200 border-l-gray-200 border-r-gray-200 rounded-full animate-spin mx-auto mb-2"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (loadError) {
    return (
      <div className="w-full h-full bg-gray-100 flex flex-1 items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error loading map</p>
          <p className="text-sm mt-2">{loadError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerClassName="w-full h-full"
      center={center}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {/* Show marker for user location if provided */}
      {userLocation && <Marker position={userLocation} />}
      {children}
    </GoogleMap>
  );
};

export default GoogleMapView;
