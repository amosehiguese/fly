"use client";

import React, { useState, useRef } from "react";
import { SendMessageRequest } from "@/api/interfaces/chats";
import { useAdminSendMessage } from "@/hooks/useChat";
import { FiSend, FiPaperclip, FiX } from "react-icons/fi";
import Image from "next/image";

interface MessageInputProps {
  chatId: number;
  onSend?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  chatId,
  onSend,
}) => {
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendMessageMutation = useAdminSendMessage();

  const handleSend = async () => {
    if ((!message.trim() && !imageFile) || sendMessageMutation.isPending)
      return;

    const request: SendMessageRequest = {
      chat_id: chatId,
      message: message.trim(),
      image: imageFile,
    };

    // If there's an image, upload it first and get the URL

    sendMessageMutation.mutate(request, {
      onSuccess: () => {
        setMessage("");
        setImagePreview(null);
        setImageFile(null);
        // Call the onSend callback if provided
        if (onSend) onSend();
      },
      onError: (error) => {
        console.error("Error sending message:", error);
        // Handle error
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the image
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setImageFile(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-3">
      {imagePreview && (
        <div className="relative mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-dashed border-blue-300 dark:border-blue-700 rounded-lg w-full">
          <div className="flex items-center mb-2">
            <div className="bg-blue-100 dark:bg-blue-800 p-1 rounded-full mr-2">
              <FiPaperclip
                size={16}
                className="text-blue-600 dark:text-blue-300"
              />
            </div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Your attachment preview
            </span>
          </div>

          <div className="relative w-32 h-32 mx-auto rounded-md overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
            <Image
              width={500}
              height={500}
              src={imagePreview}
              alt="Your attachment"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Will be sent with your message
            </span>
            <button
              onClick={handleRemoveImage}
              className="flex items-center bg-white dark:bg-gray-800 text-red-500 dark:text-red-400 px-2 py-1 rounded-md text-sm border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              aria-label="Remove image"
            >
              <FiX size={14} className="mr-1" />
              Remove
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="w-full border rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={1}
            style={{ minHeight: "40px", maxHeight: "120px" }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-4 right-3 text-gray-500 hover:text-gray-700"
            aria-label="Attach image"
          >
            <FiPaperclip size={18} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={
            (!message.trim() && !imageFile) || sendMessageMutation.isPending
          }
          className={`p-2 rounded-full flex items-center justify-center ${
            message.trim() || imageFile
              ? "bg-primary text-white hover:bg-primary-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
          aria-label="Send message"
        >
          <FiSend size={18} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
