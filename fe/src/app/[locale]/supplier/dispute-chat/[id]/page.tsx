"use client";

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  Avatar,
  MessageSeparator,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { useSendSupplierMessage } from "@/hooks/supplier/useSendSupplierMessage";
import { useSupplierDisputeMessages } from "@/hooks/supplier/useSupplierMessages";
import { useRouter } from "@/i18n/navigation";
import { format, isSameDay, isToday, isYesterday } from "date-fns";
import ImageViewer from "@/components/ImageViewer";
import { JSX } from "react";
import { SupplierDisputeChatMessage } from "@/api/interfaces/suppliers/chats";
import { useParams } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: messages } = useSupplierDisputeMessages(id);
  const sendMessage = useSendSupplierMessage(id);

  const handleSend = (message: string, file?: File) => {
    if (!message.trim()) return;
    sendMessage.mutate({ message: message, file: file });
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload only image files");
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("File size should be less than 5MB");
      return;
    }

    try {
      sendMessage.mutate({ message: "", file: file });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    }
  };

  return (
    <div className="relative h-[85vh] md:h-[100vh]">
      <MainContainer>
        <ChatContainer>
          <ConversationHeader style={{ backgroundColor: "#fff" }}>
            <ConversationHeader.Back
              onClick={() => router.back()}
              color="#000"
              style={{ color: "black" }}
            />
            <Avatar name="Customer" src="/logo-round-black.png" />
            <ConversationHeader.Content
              info="Online"
              userName={`Dispute Id: ${id}`}
            >
              <div className="flex-1 flex w-full justify-center items-center">
                <div className="flex flex-col items-center mr-12">
                  <div className="font-bold text-xs md:text-[16px]">{`Dispute Id: ${id}`}</div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Online</span>
                  </div>
                </div>
              </div>
            </ConversationHeader.Content>
          </ConversationHeader>

          <MessageList scrollBehavior="smooth">
            {messages?.data?.reduce(
              (
                acc: JSX.Element[],
                msg: SupplierDisputeChatMessage,
                index: number,
                array: SupplierDisputeChatMessage[]
              ) => {
                const messageDate = new Date(msg.created_at);
                const prevMessageDate =
                  index > 0 ? new Date(array[index - 1].created_at) : null;

                if (
                  !prevMessageDate ||
                  !isSameDay(messageDate, prevMessageDate)
                ) {
                  acc.push(
                    <MessageSeparator
                      key={`date-${index}`}
                      className="px-4"
                      content={
                        isToday(messageDate)
                          ? "Today"
                          : isYesterday(messageDate)
                            ? "Yesterday"
                            : format(messageDate, "MMMM d, yyyy")
                      }
                    />
                  );
                }

                acc.push(
                  msg.image_url ? (
                    <div key={index} className="flex flex-col">
                      <ImageViewer
                        className={`p-[2px] m-2 max-w-[200px] border-2 border-red-200 rounded-[18px] ${
                          msg.sender_type === "supplier"
                            ? "ml-auto mr-8 rounded-[18px] rounded-tr-[4px]"
                            : "mr-auto ml-8 rounded-[18px] rounded-tl-[4px]"
                        }`}
                        src={`${
                          process.env.NEXT_PUBLIC_API_BASE_URL
                        }${msg.image_url.slice(1)}`}
                        alt="Sent image"
                      />
                      <span
                        className={`text-xs text-gray-500 mb-4 ${
                          msg.sender_type === "supplier"
                            ? "text-right mr-8"
                            : "text-left ml-8"
                        }`}
                      >
                        {format(new Date(msg.created_at), "h:mm aaa")}
                      </span>
                    </div>
                  ) : (
                    <div key={index} className="flex flex-col">
                      <Message
                        avatarSpacer
                        avatarPosition={
                          msg.sender_type === "supplier"
                            ? "center-right"
                            : "center-left"
                        }
                        model={{
                          message: msg.message,
                          sender: msg.sender_type,
                          direction:
                            msg.sender_type === "supplier"
                              ? "outgoing"
                              : "incoming",
                          position: "single",
                        }}
                      >
                        <Avatar
                          name={
                            msg.sender_type === "supplier" ? "You" : "Customer"
                          }
                          size="sm"
                          src={
                            msg.sender_type === "supplier"
                              ? `https://avatar.iran.liara.run/username?username=${msg.sender_type || "admin" || "you"}&background=fde7e7&color=ec1b25`
                              : "/logo-round-black.png"
                          }
                        />
                      </Message>
                      <span
                        className={`text-xs text-gray-500 mt-1 mb-4 ${
                          msg.sender_type === "supplier"
                            ? "text-right mr-8"
                            : "text-left ml-8"
                        }`}
                      >
                        {format(new Date(msg.created_at), "h:mm aaa")}
                      </span>
                    </div>
                  )
                );

                return acc;
              },
              []
            )}
          </MessageList>

          <MessageInput
            placeholder="Type message here"
            attachButton={true}
            onAttachClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleImageUpload(file);
              };
              input.click();
            }}
            onSend={(innerHtml, textContent, innerText, nodes) => {
              const file = nodes[0] instanceof File ? nodes[0] : undefined;
              handleSend(textContent, file);
            }}
            autoFocus
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default Page;
