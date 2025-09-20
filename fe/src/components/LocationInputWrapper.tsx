"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguageStore } from "@/store/languageStore";

// Define types for react-google-places-autocomplete
interface GooglePlaceOption {
  label: string;
  value: string;
}

type SingleValue<T> = T | null;

// Use more specific type for selectProps
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SelectProps = any;

// Dynamically import to avoid SSR/hydration issues
const GooglePlacesAutocomplete = dynamic(
  () => import("react-google-places-autocomplete"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-10 w-full" />,
  }
);

type LocationInputWrapperProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  onBlur?: () => void;
  icon?: React.ReactNode;
  // Add properties to match how it's being used
  apiKey?: string;
  debounce?: number;
  minLengthAutocomplete?: number;
  selectProps?: SelectProps; // For backward compatibility
};

export default function LocationInputWrapper({
  value,
  onChange,
  placeholder,
  name,
  onBlur,
  icon,
  apiKey,
  debounce = 400,
  minLengthAutocomplete = 2,
  selectProps,
}: LocationInputWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { language } = useLanguageStore();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) {
    return <Skeleton className="h-10 w-full" />;
  }

  // If selectProps is provided, use it directly (for backwards compatibility)
  if (selectProps) {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {icon}
          </div>
        )}
        {/* Key prop ensures complete re-render when language changes */}
        <div key={`location-input-${language}-${selectProps.name || name}`}>
          <GooglePlacesAutocomplete
            apiKey={apiKey || process.env.NEXT_PUBLIC_GOOGLE_API_KEY}
            debounce={debounce}
            minLengthAutocomplete={minLengthAutocomplete}
            selectProps={{
              ...selectProps,
              instanceId: `places-${selectProps.name || name || Math.random().toString(36).substring(7)}`,
              menuPortalTarget:
                typeof document !== "undefined" ? document.body : null,
            }}
          />
        </div>
      </div>
    );
  }

  // Otherwise, use the individual props
  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {icon}
        </div>
      )}
      {/* Key prop ensures complete re-render when language changes */}
      <div key={`location-input-${language}-${name}`}>
        <GooglePlacesAutocomplete
          apiKey={apiKey || process.env.NEXT_PUBLIC_GOOGLE_API_KEY}
          debounce={debounce}
          minLengthAutocomplete={minLengthAutocomplete}
          selectProps={{
            instanceId: `places-${name}`, // Fixed ID independent of render count
            value: value ? { label: value, value } : null,
            onChange: (option: SingleValue<GooglePlaceOption>) =>
              onChange?.(option?.label || ""),
            placeholder,
            name,
            onBlur,
            menuPortalTarget:
              typeof document !== "undefined" ? document.body : null, // Prevent portal issues
          }}
        />
      </div>
    </div>
  );
}
