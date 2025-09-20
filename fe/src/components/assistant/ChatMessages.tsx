import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import TypingIndicator from "./TypingIndidcator";
import { useTyping } from "@/context/context";

interface MessageContent {
  text: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    annotations: Array<any>;
    value: string;
  };
  type: "text";
}

export interface Message {
  assistant_id: string | null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachments: any[];

  content: MessageContent[];

  created_at: number;

  id: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>;

  object: "thread.message";

  role: "user" | "assistant";

  run_id: string;

  thread_id: string;
}

interface ChatMessagesProps {
  messages: Message[];
  threadLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  threadLoading,
  messagesEndRef,
}) => {
  const { isTyping } = useTyping();
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  return (
    <div
      className={`flex-1 overflow-y-scroll mb-2 w-full md:h-[500px] p-2 max-h-[calc(100vh-250px)] md:max-h-[calc(100vh-150px)] border-[0.5px] border-[#676767] rounded-[12px]`}
    >
      {threadLoading ? (
        <div className="flex justify-center items-center h-full">
          <div
            className={`w-10 h-10 border-4 border-t-blue-600 
                    border-gray-200 rounded-full animate-spin`}
            role="status"
          ></div>
        </div>
      ) : (
        <div className={`px-[20px]`}>
          {messages.length === 0 && (
            <div className="text-center">
              <div>
                <p className="text-gray-500 text-xl mb-4">
                  No messages yet. Send a message to start a chat with Flyttman
                  Assistant
                </p>
              </div>
            </div>
          )}
          {[...messages]
            .sort((a, b) => a.created_at - b.created_at)
            .map((message, index) => (
              <div
                key={index}
                className={`p-2 rounded my-[10px] ${
                  message.role === "user"
                    ? "bg-gray-800 self-end max-w-[45%] ml-auto text-gray-200"
                    : "bg-[#000] self-start md:max-w-[50%] mr-auto text-gray-200"
                }`}
              >
                <strong className={`flex items-center`}>
                  {message.role === "assistant" ? (
                    <p className={`ml-[5px]`}>Flyttman Assistant</p>
                  ) : (
                    "You"
                  )}
                  :{" "}
                </strong>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {message.content[0].text.value}
                </ReactMarkdown>
              </div>
            ))}
          <TypingIndicator />
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
