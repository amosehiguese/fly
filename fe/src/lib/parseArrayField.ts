/**
 * Safely parses a value that might be:
 * - Already an array
 * - A JSON string representing an array
 * - A multiply-stringified array
 * - Malformed data
 *
 * @param value The value to parse
 * @param defaultValue The default value to return if parsing fails
 * @returns The parsed array or default value
 */
export function parseArrayField(
  value: unknown,
  defaultValue: string[] = []
): string[] {
  // If it's already an array, return it
  if (Array.isArray(value)) {
    return value;
  }

  // If it's not a string, return default
  if (typeof value !== "string" || !value.trim()) {
    return defaultValue;
  }

  // Try to parse the string, potentially multiple times
  let result = value;
  let parsed;
  let attempts = 0;
  const MAX_ATTEMPTS = 5; // Prevent infinite loops

  while (typeof result === "string" && attempts < MAX_ATTEMPTS) {
    try {
      parsed = JSON.parse(result);

      // If we got an array, we're done
      if (Array.isArray(parsed)) {
        return parsed;
      }

      // If we parsed something but it's not an array,
      // it might need another round of parsing
      result = parsed;
      attempts++;
    } catch {
      // Try cleaning the string before giving up
      try {
        // Handle malformed JSON with extra backslashes
        const cleaned = result
          .replace(/\\+"/g, '"') // Replace multiple backslashes before quotes
          .replace(/\\\\/g, "\\") // Replace double backslashes
          .replace(/\\/g, "") // Remove remaining backslashes as last resort
          .trim();

        parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed)) {
          return parsed;
        }

        // If we got something but not an array, try one more time
        if (parsed && typeof parsed === "object") {
          return defaultValue;
        }

        // Give up
        return defaultValue;
      } catch {
        // If all attempts fail, return default
        return defaultValue;
      }
    }
  }

  // If we got here and have an array, return it
  if (Array.isArray(result)) {
    return result;
  }

  // Otherwise return default
  return defaultValue;
}

/**
 * Safely parses a value that might be:
 * - Already an array
 * - A JSON string representing an array
 * - A multiply-stringified array
 * - Malformed data
 *
 * @param value The value to parse
 * @param defaultValue The default value to return if parsing fails
 * @returns The parsed array or default value
 */
export function parseObjectField(
  value: unknown,
  defaultValue: { needed: boolean; description: string } = {
    needed: false,
    description: "",
  }
): { needed: boolean; description: string } {
  // Handle null or undefined
  if (value == null) {
    return defaultValue;
  }

  // If it's already the correct object type, return it
  if (typeof value === "object" && !Array.isArray(value) && value !== null) {
    const obj = value as Record<string, unknown>;
    return {
      needed:
        typeof obj.needed === "boolean" ? obj.needed : defaultValue.needed,
      description:
        typeof obj.description === "string"
          ? obj.description
          : defaultValue.description,
    };
  }

  // If it's not a string, return default
  if (typeof value !== "string" || !value.trim()) {
    return defaultValue;
  }

  // Try to parse the JSON string
  try {
    const parsed = JSON.parse(value);

    // Validate the parsed object structure
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return {
        needed:
          typeof parsed.needed === "boolean"
            ? parsed.needed
            : defaultValue.needed,
        description:
          typeof parsed.description === "string"
            ? parsed.description
            : defaultValue.description,
      };
    }
  } catch {
    // If parsing fails, try to clean the string (optional)
    try {
      const cleaned = value.replace(/\\+"/g, '"').replace(/\\\\/g, "\\").trim();

      const parsed = JSON.parse(cleaned);

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        return {
          needed:
            typeof parsed.needed === "boolean"
              ? parsed.needed
              : defaultValue.needed,
          description:
            typeof parsed.description === "string"
              ? parsed.description
              : defaultValue.description,
        };
      }
    } catch {
      // If all attempts fail, return default
      return defaultValue;
    }
  }

  return defaultValue;
}
