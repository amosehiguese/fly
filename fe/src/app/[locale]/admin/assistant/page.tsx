"use client";

import OpenAI from "openai";
import { useEffect, useRef, useState } from "react";
// import ActiveTokensSidebar from "./components/ActiveTokensSidebar"
// import AgenNicky from "./assets/microbial-profile.png";
import { TypingProvider } from "@/context/context";
import MessageInput from "@/components/assistant/MessageInput";

import ChatMessages, { Message } from "@/components/assistant/ChatMessages";
// import CreateThreadModal from "./components/CreateThreadModal";

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const client = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [threadLoading, setThreadLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const storedThreadId = localStorage.getItem("flyttman_threads");
      if (storedThreadId) {
        const parsedThreadId = JSON.parse(storedThreadId);
        setThreadId(parsedThreadId[0].id);
        const threadId = parsedThreadId[0].id;
        setThreadLoading(true);
        try {
          const response = await client.beta.threads.messages.list(threadId);
          setMessages(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response.data.map((message: any) => ({
              ...message,
              assistant_id: message.assistant_id || "",
            }))
          );
        } catch (error) {
          console.error("Failed to fetch messages:", error);
        } finally {
          setThreadLoading(false);
        }
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <TypingProvider>
      <div className="flex h-screen">
        {/* Main Chat Section */}
        <div
          className={`flex-1 md:ml-0 bg-[#fff] flex flex-col relative overflow-y-hidden px-[20px]`}
        >
          {/* Chat Header */}
          <div className={`flex items-center space-x-[8px] w-full p-4`}>
            <h1 className="text-[20px] font-bold text-[#000]">Flyttman AI</h1>
          </div>

          {/* Chat Messages */}
          <ChatMessages
            messages={messages}
            threadLoading={threadLoading}
            messagesEndRef={messagesEndRef}
          />

          {/* Fixed Input Section */}
          <MessageInput
            messages={messages}
            setMessages={setMessages}
            input={input}
            setInput={setInput}
            threadId={threadId}
            setThreadId={setThreadId}
            client={client}
          />
        </div>

        {/* Right Sidebar for Active Tokens */}
        {/* <div className={`w-1/5 hidden md:block`}>
                    <ActiveTokensSidebar />
                </div> */}
      </div>
    </TypingProvider>
  );
}
