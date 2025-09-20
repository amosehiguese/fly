import { getAllKeys } from "./getAllKeys";

type FormatterFunction<T> = (value: T[keyof T]) => string;

interface FormatOptions<T extends object> {
  headerMap?: Partial<Record<keyof T, string>>;
  formatters?: Partial<Record<keyof T, FormatterFunction<T>>>;
}

export const formatTableData = <T extends object>(
  data: T[],
  options?: FormatOptions<T>
) => {
  // Get all unique keys from the data array
  const keys = getAllKeys(data) as Array<keyof T>;

  // Create a mapping of original keys to header labels
  const headerMapping = new Map<keyof T, string>(
    keys.map((key) => [
      key,
      options?.headerMap?.[key] ??
        String(key).charAt(0).toUpperCase() + String(key).slice(1),
    ])
  );

  // Get headers in the same order as keys
  const headers = Array.from(headerMapping.values());

  // Transform each object into an array of formatted values
  const cells = data.map((item) =>
    keys.map((key) => {
      const value = item[key];

      return options?.formatters?.[key]?.(value) ?? String(value ?? "");
    })
  );

  return {
    headers,
    cells,
  };
};
