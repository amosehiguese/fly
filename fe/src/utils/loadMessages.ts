// utils/loadMessages.ts
import { readFileSync } from "fs";
import path from "path";

export async function loadMessages(locale: string) {
  try {
    const files = ["common", "home", "cities"]; // Add more as needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages: Record<string, any> = {};

    for (const file of files) {
      const filePath = path.join(
        process.cwd(),
        "messages",
        locale,
        `${file}.json`
      );
      const data = JSON.parse(readFileSync(filePath, "utf-8"));
      messages[file] = data;
    }

    return messages;
  } catch (error) {
    console.error("Error loading messages:", error);
    return null;
  }
}
