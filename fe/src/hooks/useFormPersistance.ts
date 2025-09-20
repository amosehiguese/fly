import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { useLocalStorage } from "./useLocalStorage";

interface UseFormPersistenceProps<T> {
  formId: string;
  initialValues: T;
  onSave?: (values: T) => Promise<void>;
  debounceMs?: number;
}

export const useFormPersistence = <T extends Record<string, unknown>>({
  formId,
  initialValues,
  onSave,
  debounceMs = 1000,
}: UseFormPersistenceProps<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [debouncedValues] = useDebounce(values, debounceMs);
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "error">(
    "saved"
  );
  const [storage, setStorage] = useLocalStorage(
    `form_${formId}`,
    initialValues
  );

  // Load stored values on mount
  useEffect(() => {
    if (storage) {
      setValues(storage as T);
    }
  }, [storage]);

  // Auto-save to localStorage and backend
  useEffect(() => {
    const saveData = async () => {
      if (JSON.stringify(debouncedValues) !== JSON.stringify(storage)) {
        setSaveStatus("saving");
        try {
          setStorage(debouncedValues);
          if (onSave) {
            await onSave(debouncedValues);
          }
          setSaveStatus("saved");
        } catch (error) {
          setSaveStatus("error");
          console.error("Failed to save form data:", error);
        }
      }
    };

    saveData();
  }, [debouncedValues, onSave, setStorage, storage]);

  const updateValues = (newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setStorage(initialValues);
    setSaveStatus("saved");
  };

  return {
    values,
    updateValues,
    resetForm,
    saveStatus,
  };
};
