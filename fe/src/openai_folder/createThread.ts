import OpenAI from "openai";
import { Thread } from "openai/resources/beta/threads/threads";

export async function createThread(
  client: OpenAI,
  message: string,
  existingThreadId?: string
): Promise<Thread> {
  let thread: Thread;

  if (existingThreadId) {
    // Retrieve an existing thread
    thread = await client.beta.threads.retrieve(existingThreadId);
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });
  } else {
    // Create a new thread
    thread = await client.beta.threads.create();
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    // Save the new thread to local storage
    const threads = JSON.parse(
      localStorage.getItem("flyttman_threads") || "[]"
    );
    threads.push({ id: thread.id, created_at: thread.created_at });
    localStorage.setItem("flyttman_threads", JSON.stringify(threads));
  }

  return thread;
}
