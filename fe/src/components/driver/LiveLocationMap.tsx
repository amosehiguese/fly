'use client';


import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useDriverOrders } from '@/hooks/driver/useDriverOrders';

interface LiveLocationMapProps {
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
}

export default function LiveLocationMap({ onLocationUpdate }: LiveLocationMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { mutate: updateLocation, isPending: isUpdating } = useDriverOrders().updateDriverLocation;
  const watchIdRef = useRef<number | null>(null);

  // Initialize the map
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      const map = new window.google.maps.Map(
        document.getElementById('map') as HTMLElement,
        {
          zoom: 15,
          center: { lat: 59.3293, lng: 18.0686 }, // Default to Stockholm
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: true,
        }
      );
      mapRef.current = map;

      // Add a marker
      const marker = new window.google.maps.Marker({
        position: { lat: 59.3293, lng: 18.0686 },
        map,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
        },
      });
      markerRef.current = marker;

      return () => {
        if (marker) marker.setMap(null);
      };
    }
  }, []);

  // Start/stop location tracking
  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setError(null);
    setIsTracking(true);

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateMapPosition(latitude, longitude);
      },
      (err: GeolocationPositionError) => {
        setError(`Error getting location: ${err.message}`);
        setIsTracking(false);
      },
      { enableHighAccuracy: true }
    );

    // Watch position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateMapPosition(latitude, longitude);
        
        // Send location to backend
        updateLocation(
          { latitude, longitude },
          {
            onSuccess: () => {
              // Optional: Show success message or update UI
            },
            onError: (err) => {
              console.error('Failed to update location:', err);
            },
          }
        );
      },
      (err) => {
        setError(`Error watching location: ${err.message}`);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000, // 10 seconds
        timeout: 5000,
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  const updateMapPosition = (lat: number, lng: number) => {
    const location = { lat, lng };
    setCurrentLocation(location);
    
    if (markerRef.current) {
      markerRef.current.setPosition(location);
    }
    
    if (mapRef.current) {
      mapRef.current.panTo(location);
    }
    
    if (onLocationUpdate) {
      onLocationUpdate(location);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div id="map" className="w-full h-[calc(100vh-200px)] md:h-[70vh] rounded-lg"></div>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <button
          onClick={toggleTracking}
          disabled={isUpdating}
          className={`flex items-center justify-center px-6 py-3 rounded-full shadow-lg ${
            isTracking ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } text-white font-medium`}
        >
          {isUpdating ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Uppdaterar...
            </>
          ) : isTracking ? (
            'Sluta spåra position'
          ) : (
            'Starta positionsspårning'
          )}
        </button>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {currentLocation && (
        <div className="mt-4 text-sm text-gray-600">
          Din position: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}
