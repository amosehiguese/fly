import React, { useState } from "react";
import { Message } from "../../components/assistant/ChatMessages"; // Adjust the import path as necessary
import { createAssistant } from "../../openai_folder/createAssistant";
import { createThread } from "../../openai_folder/createThread";
import { createRun } from "../../openai_folder/createRun";
import { performRun } from "../../openai_folder/performRun";
import { useTyping } from "../../context/context";

interface MessageInputProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  threadId: string | undefined;
  setThreadId: React.Dispatch<React.SetStateAction<string | undefined>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any; // Adjust the type as necessary
}

const MessageInput: React.FC<MessageInputProps> = ({
  messages,
  setMessages,
  input,
  setInput,
  threadId,
  setThreadId,
  client,
}) => {
  const { setTyping, isTyping } = useTyping();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedFile, _] = useState<File | null>(null);

  const handleSend = async () => {
    if (input.trim() === "" && !selectedFile) return;

    setMessages([
      ...messages,
      {
        assistant_id: "",
        attachments: [],
        content: [{ text: { annotations: [], value: input }, type: "text" }],
        created_at: Date.now(),
        id: `${Date.now()}`,
        metadata: {},
        object: "thread.message",
        role: "user",
        run_id: "",
        thread_id: threadId || "",
      },
    ]);
    setInput("");

    const assistant = await createAssistant(client);

    try {
      const thread = await createThread(client, input, threadId);
      setThreadId(thread.id);

      setTyping(true);

      let result;
      if (selectedFile) {
        console.log("selected file:::", selectedFile);
        // result = await storyWriterTool.handler({ file: selectedFile });
      } else {
        const run = await createRun(client, thread, assistant.id);
        result = await performRun(client, thread, run);
      }

      if (result) {
        setTyping(false);
        console.log("Result:::", result);
        setMessages((prevMessages: Message[]) => [
          ...prevMessages,
          {
            assistant_id: assistant.id,
            attachments: [],
            content: [
              {
                text: { annotations: [], value: result.text.value },
                type: "text",
              },
            ],
            created_at: Date.now(),
            id: `${Date.now()}`,
            metadata: {},
            object: "thread.message",
            role: "assistant",
            run_id: "",
            thread_id: thread.id,
          },
        ]);
      } else {
        setMessages((prevMessages: Message[]) => [
          ...prevMessages,
          {
            assistant_id: "Nicky",
            attachments: [],
            content: [
              {
                text: { annotations: [], value: "[Non-text response]" },
                type: "text",
              },
            ],
            created_at: Date.now(),
            id: `${Date.now()}`,
            metadata: {},
            object: "thread.message",
            role: "assistant",
            run_id: "",
            thread_id: threadId || "",
          },
        ]);
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
    }
  };

  return (
    <div
      className="flex items-center bg-[#000] p-2 rounded-full shadow 
    absolute bottom-[10px] md:bottom-0 w-[95%] md:w-[96%]"
    >
      <input
        type="text"
        className="flex-1 p-2 rounded bg-transparent outline-none text-[#9d9999]"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        disabled={isTyping}
      />
      <button
        className="p-2 lg:px-[30px] bg-[#0e166e] text-white rounded-full hover:bg-blue-600"
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
