"use client";

import React, { useState } from "react";
import { UserType } from "@/api/interfaces/chats";
import { FiX } from "react-icons/fi";

interface NewConversationModalProps {
  onClose: () => void;
  onSubmit: (
    recipientId: number,
    recipientType: UserType,
    reason: string,
    message: string
  ) => void;
  isAdmin?: boolean;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  onClose,
  onSubmit,
  isAdmin = false,
}) => {
  const [recipientId, setRecipientId] = useState<string>("");
  const [recipientType, setRecipientType] = useState<UserType>(
    isAdmin ? "customer" : "admin"
  );
  const [reason, setReason] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!recipientId) {
      newErrors.recipientId = "Recipient ID is required";
    } else if (!/^\d+$/.test(recipientId)) {
      newErrors.recipientId = "Recipient ID must be a number";
    }

    if (!reason) {
      newErrors.reason = "Reason is required";
    }

    if (!message) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(parseInt(recipientId, 10), recipientType, reason, message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">New Conversation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Recipient Type
            </label>
            <select
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value as UserType)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={!isAdmin}
            >
              {isAdmin ? (
                <>
                  <option value="customer">Customer</option>
                  <option value="supplier">Supplier</option>
                </>
              ) : (
                <option value="admin">Admin</option>
              )}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Recipient ID
            </label>
            <input
              type="text"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.recipientId ? "border-red-500" : ""
              }`}
              placeholder="Enter recipient ID"
            />
            {errors.recipientId && (
              <p className="text-red-500 text-xs mt-1">{errors.recipientId}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.reason ? "border-red-500" : ""
              }`}
            >
              <option value="">Select a reason</option>
              <option value="Payment Issue">Payment Issue</option>
              <option value="Delivery Problem">Delivery Problem</option>
              <option value="Product Inquiry">Product Inquiry</option>
              <option value="Return Request">Return Request</option>
              <option value="General Support">General Support</option>
            </select>
            {errors.reason && (
              <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.message ? "border-red-500" : ""
              }`}
              rows={4}
              placeholder="Type your message..."
            ></textarea>
            {errors.message && (
              <p className="text-red-500 text-xs mt-1">{errors.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Start Conversation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewConversationModal;
