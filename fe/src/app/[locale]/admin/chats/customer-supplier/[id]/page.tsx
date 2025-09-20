"use client";

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  // MessageInput,
  ConversationHeader,
  Avatar,
  MessageSeparator,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { useParams, useRouter } from "next/navigation";
import ImageViewer from "@/components/ImageViewer";
import { imageBaseUrl } from "@/api";
import { format, isSameDay, isToday, isYesterday } from "date-fns";
import { JSX } from "react";
import { useFetchCustomerSupplierMessagesById } from "@/hooks/admin/useFetchCustomerSupplierMessages";

const Page = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data } = useFetchCustomerSupplierMessagesById(Number(id));

  return (
    <div className="relative h-[100vh]">
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
              userName={`Dispute Id ${id}`}
            >
              <div className="flex-1 flex w-full justify-center items-center">
                <div className="flex flex-col items-center mr-12">
                  <div className="font-bold text-[16px]">{`Chat Id: ${id}`}</div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Online</span>
                  </div>
                </div>
              </div>
            </ConversationHeader.Content>
          </ConversationHeader>

          <MessageList scrollBehavior="smooth">
            {data?.data?.reduce((acc: JSX.Element[], msg, index, array) => {
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
                        msg.sender_type === "admin"
                          ? "ml-auto mr-8 rounded-[18px] rounded-tr-[4px]"
                          : "mr-auto ml-8 rounded-[18px] rounded-tl-[4px]"
                      }`}
                      src={`${imageBaseUrl}${msg.image_url}`}
                      alt="Sent image"
                    />
                    <span
                      className={`text-xs text-gray-500 mb-4 ${
                        msg.sender_type === "admin"
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
                        msg.sender_type === "admin"
                          ? "center-right"
                          : "center-left"
                      }
                      model={{
                        message: msg.message,
                        sender: msg.sender_type,
                        direction:
                          msg.sender_type === "admin" ? "outgoing" : "incoming",
                        position: "single",
                      }}
                    >
                      <Avatar
                        name={
                          msg.sender_type === "admin" ? "Admin" : "Customer"
                        }
                        size="sm"
                        src={
                          msg.sender_type === "supplier"
                            ? "https://avatar.iran.liara.run/username?username=Supplier&background=fde7e7&color=ec1b25"
                            : "https://avatar.iran.liara.run/username?username=Customer&background=fde7e7&color=ec1b25"
                        }
                      />
                    </Message>
                    <span
                      className={`text-xs text-gray-500 mt-1 mb-4 ${
                        msg.sender_type === "admin"
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
            }, [])}
          </MessageList>

          {/* <MessageInput
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
          /> */}
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default Page;
