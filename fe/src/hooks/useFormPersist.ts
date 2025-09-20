import { useEffect, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";

export const useFormPersist = <T extends object>(
  form: UseFormReturn<T>,
  formKey: string,
  excludeFields: string[] = []
) => {
  // Load saved form data on mount
  useMemo(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(formKey);
      if (saved) {
        const parsedData = JSON.parse(saved);
        // Only set values for fields that exist in the form
        Object.keys(parsedData).forEach((key) => {
          if (!excludeFields.includes(key)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            form.setValue(key as any, parsedData[key]);
          }
        });
      }
    }
  }, []);

  // Save form data on change
  useEffect(() => {
    const subscription = form.watch((data) => {
      const formData = { ...data };
      // Remove excluded fields before storing
      excludeFields.forEach(
        (field) => delete formData[field as keyof typeof formData]
      );
      localStorage.setItem(formKey, JSON.stringify(formData));
    });

    return () => subscription.unsubscribe();
  }, [form, formKey, excludeFields]);

  // Utility function to clear saved data
  const clearSavedData = () => {
    localStorage.removeItem(formKey);
  };

  return { clearSavedData };
};
