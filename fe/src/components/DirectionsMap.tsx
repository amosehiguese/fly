import { useCallback, useState, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, InfoWindow } from "@react-google-maps/api";
import { useGeolocated } from "react-geolocated";
import { ChevronDown, ChevronUp, Navigation, ArrowRight, Map, ExternalLink } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
} from "@/components/ui/drawer";
import { googleMapsConfig } from "@/lib/googleMapsConfig";

// Default center (fallback position - Stockholm coordinates)
const defaultCenter = {
  lat: 59.334591,
  lng: 18.063240,
};

// Using shared Google Maps config

type GoogleMapType = google.maps.Map | null;
type DirectionsResultType = google.maps.DirectionsResult | null;
type DirectionsStepType = google.maps.DirectionsStep;

interface DirectionsMapProps {
  pickupAddress: string;
  dropoffAddress: string;
  children?: React.ReactNode;
}

const DirectionsMap = ({ pickupAddress, dropoffAddress, children }: DirectionsMapProps) => {
  const [map, setMap] = useState<GoogleMapType>(null);
  const [directionsResult, setDirectionsResult] = useState<DirectionsResultType>(null);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
  const [estimatedDistance, setEstimatedDistance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navigationSteps, setNavigationSteps] = useState<DirectionsStepType[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [showAllSteps, setShowAllSteps] = useState<boolean>(false);
  const [navigationMode, setNavigationMode] = useState<boolean>(false);
  const [userPosition, setUserPosition] = useState<google.maps.LatLng | null>(null);
  const [userHeading, setUserHeading] = useState<number>(0);
  const mapRef = useRef<google.maps.Map | null>(null);
  const watchId = useRef<number | null>(null);
  const lastKnownLocation = useRef<{lat: number, lng: number} | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);

  // Load Google Maps API with shared config
  const { isLoaded, loadError } = useJsApiLoader(googleMapsConfig);

  // Get user's location initially
  const { coords } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000,
  });
  
  // Calculate heading between two points
  const calculateHeading = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const dLon = (lng2 - lng1) * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    let heading = Math.atan2(y, x) * 180 / Math.PI;
    
    // Convert to 0-360 degrees
    heading = (heading + 360) % 360;
    return heading;
  };
  
  // Check if the user has completed the current step
  const checkStepCompletion = useCallback((position: google.maps.LatLng) => {
    if (!navigationSteps[currentStepIndex] || !position) return;
    
    // Get the end location of the current step
    const currentStep = navigationSteps[currentStepIndex];
    const endLocation = currentStep.end_location;
    
    if (endLocation) {
      // Calculate distance to the end of the current step
      const endPoint = new google.maps.LatLng(endLocation.lat(), endLocation.lng());
      const distance = google.maps.geometry.spherical.computeDistanceBetween(position, endPoint);
      
      // If we're within 30 meters of the end of the step, move to the next step
      if (distance < 30 && currentStepIndex < navigationSteps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      }
    }
  }, [navigationSteps, currentStepIndex, setCurrentStepIndex]);
  
  // Start real-time location tracking when navigation mode is enabled
  useEffect(() => {
    if (navigationMode && navigator.geolocation) {
      // Clear any existing watch
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
      
      // Start watching position with high accuracy
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition = new google.maps.LatLng(latitude, longitude);
          setUserPosition(newPosition);
          
          // Calculate heading if we have a previous position
          if (lastKnownLocation.current) {
            const heading = calculateHeading(
              lastKnownLocation.current.lat,
              lastKnownLocation.current.lng,
              latitude,
              longitude
            );
            if (!isNaN(heading)) {
              setUserHeading(heading);
            }
          }
          
          // Update last known location
          lastKnownLocation.current = { lat: latitude, lng: longitude };
          
          // Check if we've completed the current step and should advance
          checkStepCompletion(newPosition);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { 
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    }
    
    // Cleanup function
    return () => {
      if (watchId.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [navigationMode, checkStepCompletion]);

  // Calculate directions when addresses are provided and map is loaded
  useEffect(() => {
    if (isLoaded && map && pickupAddress && dropoffAddress) {
      const directionsService = new google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: pickupAddress,
          destination: dropoffAddress,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirectionsResult(result);
            setIsLoading(false);
            
            // Extract estimated time and distance
            if (result?.routes[0]?.legs[0]) {
              const leg = result.routes[0].legs[0];
              setEstimatedTime(leg.duration?.text || null);
              setEstimatedDistance(leg.distance?.text || null);
              
              // Extract turn-by-turn navigation steps
              if (leg.steps && leg.steps.length > 0) {
                setNavigationSteps(leg.steps);
              }
            }
          } else {
            setError(`Directions request failed: ${status}`);
            setIsLoading(false);
          }
        }
      );
    }
  }, [isLoaded, map, pickupAddress, dropoffAddress]);

  const onLoad = useCallback(function callback(map: GoogleMapType) {
    if (coords) {
      const userLocation = new window.google.maps.LatLng(
        coords.latitude,
        coords.longitude
      );
      map?.setCenter(userLocation);
      setUserPosition(userLocation);
      lastKnownLocation.current = { lat: coords.latitude, lng: coords.longitude };
    } else {
      const bounds = new window.google.maps.LatLngBounds(defaultCenter);
      map?.fitBounds(bounds);
    }
    setMap(map);
    mapRef.current = map;
  }, [coords]);
  
  // Toggle navigation mode
  const toggleNavigationMode = () => {
    const newMode = !navigationMode;
    setNavigationMode(newMode);
    
    if (mapRef.current) {
      if (newMode) {
        // Configure map for navigation mode
        mapRef.current.setOptions({
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          rotateControl: false,
          tilt: 45,
          zoom: 18,
        });
        
        // Center on user position
        if (userPosition) {
          mapRef.current.setCenter(userPosition);
        }
      } else {
        // Restore default options when exiting navigation mode
        mapRef.current.setOptions({
          zoomControl: true,
          tilt: 0,
          zoom: 14,
        });
        
        // Fit the entire route
        if (directionsResult?.routes[0]?.bounds) {
          mapRef.current.fitBounds(directionsResult.routes[0].bounds);
        }
      }
    }
  };
  
  // Update map in navigation mode
  useEffect(() => {
    if (navigationMode && mapRef.current && userPosition) {
      // Center map on user's position
      mapRef.current.setCenter(userPosition);
      
      // Rotate map to match user's heading
      if (userHeading !== 0) {
        mapRef.current.setHeading(userHeading);
      }
    }
  }, [navigationMode, userPosition, userHeading]);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);
  
  // Open directions in Google Maps app or website
  const openInGoogleMaps = useCallback(() => {
    if (!pickupAddress || !dropoffAddress) return;
    
    // Format origin and destination for Google Maps URL
    const origin = encodeURIComponent(pickupAddress);
    const destination = encodeURIComponent(dropoffAddress);
    
    // Create Google Maps directions URL
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    
    // Open URL in new tab/window
    window.open(googleMapsUrl, '_blank');
  }, [pickupAddress, dropoffAddress]);

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
  if (loadError || error) {
    return (
      <div className="w-full h-full bg-gray-100 flex flex-1 items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error loading directions</p>
          <p className="text-sm mt-2">{loadError?.message || error}</p>
        </div>
      </div>
    );
  }

  // Determine center based on current mode and available location
  const center = userPosition 
    ? { lat: userPosition.lat(), lng: userPosition.lng() }
    : coords 
      ? { lat: coords.latitude, lng: coords.longitude } 
      : defaultCenter;

  return (
    <div className="w-full h-full relative">
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={center}
        zoom={navigationMode ? 18 : 12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: !navigationMode,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          rotateControl: !navigationMode,
          tilt: navigationMode ? 45 : 0,
          heading: navigationMode ? userHeading : 0,
        }}
      >
        {/* Show directions if available */}
        {directionsResult && (
          <DirectionsRenderer
            options={{
              directions: directionsResult,
              suppressMarkers: navigationMode,
              polylineOptions: {
                strokeColor: "#4F46E5",
                strokeWeight: 5,
              },
              // Only show the current leg in navigation mode
              routeIndex: 0,
              // In navigation mode, we only want to show a small part of the route ahead
              preserveViewport: navigationMode,
            }}
          />
        )}
        
        {/* Show current location marker with heading indicator */}
        {userPosition && (
          <Marker 
            position={{ lat: userPosition.lat(), lng: userPosition.lng() }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4F46E5",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            }}
          />
        )}
        
        {/* Show the current navigation instruction in navigation mode */}
        {navigationMode && navigationSteps.length > 0 && userPosition && (
          <InfoWindow
            position={{
              lat: userPosition.lat() + 0.0005, // Position slightly above the user marker
              lng: userPosition.lng()
            }}
          >
            <div className="p-2 max-w-[200px]">
              <span 
                className="text-xs font-bold"
                dangerouslySetInnerHTML={{ __html: navigationSteps[currentStepIndex].instructions }}
              />
            </div>
          </InfoWindow>
        )}
        
        {children}
      </GoogleMap>
      
      {/* Collapsed minimal directions (shown at top when drawer is closed) */}
      {!isLoading && directionsResult && !drawerOpen && navigationSteps.length > 0 && (
        <div className="absolute top-0 left-0 right-0 mx-auto w-full bg-white shadow-md z-10 flex justify-between items-center p-2">
          <div className="flex items-center flex-1">
            <div className="bg-blue-100 p-1 rounded-full mr-2 flex-shrink-0">
              <Navigation className="h-4 w-4 text-blue-600" />
            </div>
            <div className="overflow-hidden">
              <span 
                className="text-xs font-medium inline-block text-ellipsis overflow-hidden whitespace-nowrap max-w-[150px]"
                dangerouslySetInnerHTML={{ __html: navigationSteps[currentStepIndex].instructions }}
              />
              <span className="text-xs text-gray-500 block">{navigationSteps[currentStepIndex].distance?.text}</span>
            </div>
          </div>
          
          <div className="flex">
            {/* Button to open drawer */}
            <button 
              onClick={() => setDrawerOpen(true)}
              className="p-1 text-gray-600 hover:text-gray-800 mr-1"
              title="Show details"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            
            {/* Button to open in Google Maps */}
            <button 
              onClick={() => openInGoogleMaps()}
              className="bg-blue-100 rounded p-1 text-blue-700"
              title="Open in Google Maps"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Trip status overlay (loading state) */}
      {isLoading && (
        <div className="absolute bottom-4 left-0 right-0 mx-auto w-3/4 bg-white shadow-lg rounded-lg p-3 z-10 text-center">
          <div className="h-5 w-5 border-2 border-t-blue-500 border-b-gray-200 border-l-gray-200 border-r-gray-200 rounded-full animate-spin mx-auto mb-1"></div>
          <span className="text-sm">Calculating route...</span>
        </div>
      )}
      
      {/* Shadcn Drawer for directions */}
      {!isLoading && directionsResult && (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader className="px-4 py-2 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-500 block">Estimated arrival</span>
                  <span className="font-medium block">{estimatedTime}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Distance</span>
                  <span className="font-medium block">{estimatedDistance}</span>
                </div>
                <div className="flex space-x-2">
                  {/* Navigation mode toggle button */}
                  <button 
                    onClick={toggleNavigationMode}
                    className={`rounded-full p-1 transition-colors ${navigationMode ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                    title={navigationMode ? "Exit navigation mode" : "Start navigation mode"}
                  >
                    {navigationMode ? (
                      <Map className="h-5 w-5" />
                    ) : (
                      <Navigation className="h-5 w-5" />
                    )}
                  </button>
                  
                  {/* Open in Google Maps button */}
                  <button 
                    onClick={openInGoogleMaps}
                    className="rounded-full p-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                    title="Open in Google Maps"
                  >
                    <ExternalLink className="h-5 w-5 text-gray-600" />
                  </button>
                  
                  {/* Steps toggle button */}
                  <button 
                    onClick={() => setShowAllSteps(!showAllSteps)}
                    className="bg-gray-100 rounded-full p-1 hover:bg-gray-200 transition-colors"
                    title={showAllSteps ? "Hide all steps" : "Show all steps"}
                  >
                    {showAllSteps ? (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </DrawerHeader>
            <div className="px-4">
              {/* Current navigation step */}
              {navigationSteps.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-100 p-1 rounded-full mr-2">
                      <Navigation className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span 
                        className="text-sm font-medium"
                        dangerouslySetInnerHTML={{ __html: navigationSteps[currentStepIndex].instructions }}
                      />
                      <span className="text-xs text-gray-500 block">
                        {navigationSteps[currentStepIndex].distance?.text} 
                        ({navigationSteps[currentStepIndex].duration?.text})
                      </span>
                    </div>
                    {navigationMode && (
                      <div className="ml-auto bg-blue-500 rounded-full w-2 h-2 animate-pulse"></div>
                    )}
                  </div>
                  
                  {/* Next step preview */}
                  {navigationSteps.length > currentStepIndex + 1 && (
                    <div className="flex items-center mt-1 bg-gray-50 p-2 rounded-lg">
                      <ArrowRight className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span 
                        className="text-xs text-gray-600"
                        dangerouslySetInnerHTML={{ 
                          __html: `Next: ${navigationSteps[currentStepIndex + 1].instructions}` 
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Show all navigation steps */}
                  {showAllSteps && (
                    <div className="mt-3 border-t border-gray-100 pt-2 max-h-40 overflow-y-auto">
                      <span className="text-xs font-medium text-gray-500 block mb-2">All Steps</span>
                      {navigationSteps.map((step, index) => (
                        <div 
                          key={index} 
                          className={`flex items-start py-1 ${index === currentStepIndex ? 'bg-blue-50 -mx-2 px-2 rounded' : ''}`}
                          onClick={() => setCurrentStepIndex(index)}
                        >
                          <div className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center flex-shrink-0 
                            ${index < currentStepIndex ? 'bg-green-100 text-green-600' : 
                              index === currentStepIndex ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                          >
                            <span className="text-xs">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <span 
                              className={`text-xs ${index === currentStepIndex ? 'font-medium' : ''}`}
                              dangerouslySetInnerHTML={{ __html: step.instructions }}
                            />
                            <span className="text-xs text-gray-500 block">
                              {step.distance?.text} ({step.duration?.text})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Navigation controls */}
                  <div className="flex justify-between mt-3 pt-2 border-t border-gray-100 pb-4">
                    <button 
                      className="bg-gray-100 px-3 py-1 rounded-lg text-sm disabled:opacity-50"
                      disabled={currentStepIndex === 0}
                      onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-500 flex items-center">
                      Step {currentStepIndex + 1} of {navigationSteps.length}
                    </span>
                    <button 
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm disabled:opacity-50"
                      disabled={currentStepIndex === navigationSteps.length - 1}
                      onClick={() => setCurrentStepIndex(prev => Math.min(navigationSteps.length - 1, prev + 1))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

export default DirectionsMap;
