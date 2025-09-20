import { useState, useEffect } from "react";

interface UseDistanceCalculationProps {
  origin: string;
  destination: string;
}

export const useDistanceCalculation = ({
  origin,
  destination,
}: UseDistanceCalculationProps) => {
  const [distance, setDistance] = useState<number | undefined>();
  const [originCity, setOriginCity] = useState<string>("");
  const [destinationCity, setDestinationCity] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roundNumber = (num: number) =>
    Math.round((num + Number.EPSILON) * 100) / 100;

  useEffect(() => {
    const calculateDistance = async () => {
      if (!origin || !destination) return;

      setIsLoading(true);
      setError(null);

      const service = new google.maps.DistanceMatrixService();

      try {
        const response = await service.getDistanceMatrix({
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        });

        if (
          response.originAddresses.length &&
          response.destinationAddresses.length
        ) {
          // Extract just the city from the formatted addresses
          const extractCity = (address: string) => {
            // This regex looks for city names before postal codes or commas
            const cityMatch = address.match(/([^,]+),/);
            return cityMatch ? cityMatch[1].trim() : address;
          };

          setOriginCity(extractCity(response.originAddresses[0]));
          setDestinationCity(extractCity(response.destinationAddresses[0]));
        }

        if (response.rows[0]?.elements[0]?.distance) {
          setDistance(
            roundNumber(response.rows[0].elements[0].distance.value / 1000)
          );
        } else {
          setError("Could not calculate distance");
        }
      } catch (error) {
        setError("Error calculating distance");
        console.error("Error calculating distance:", error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateDistance();
  }, [origin, destination]);

  return { distance, originCity, destinationCity, isLoading, error };
};
