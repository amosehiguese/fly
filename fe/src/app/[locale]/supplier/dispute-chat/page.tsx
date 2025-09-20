"use client";

import { SupplierDisputeConversation } from "@/api/interfaces/suppliers/chats";
import { FullPageLoader } from "@/components/ui/loading/FullPageLoader";
import { useSupplierDisputeConversations } from "@/hooks/supplier/useSupplierMessages";
import { Avatar, ConversationList } from "@chatscope/chat-ui-kit-react";
import { Conversation } from "@chatscope/chat-ui-kit-react";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "@/i18n/navigation";
import { formatDateLocale } from "@/lib/formatDateLocale";
import { useLocale } from "next-intl";

const Page = () => {
  const router = useRouter();
  const { data, isPending } = useSupplierDisputeConversations();
  const locale = useLocale();

  if (isPending) {
    return <FullPageLoader />;
  }

  return (
    <div className="mx-auto  py-2 px-4 md:px-12">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl sm:text-2xl font-semibold">Messages</h1>
      </div>
      {data && data?.data?.length > 0 ? (
        <ConversationList className="">
          {data?.data?.map((msg: SupplierDisputeConversation) => (
            <Link
              href={`/supplier/dispute-chat/${msg.dispute_id}`}
              key={msg.dispute_id}
              className="flex w-full items-center gap-4 p-3 "
            >
              <Conversation
                className="w-full"
                info={msg.latest_message || "No message yet"}
                lastSenderName={
                  msg.latest_sender === "supplier" ? "me" : "admin"
                }
                name={`Order Id: ${msg.order_id}`}
                lastActivityTime={formatDateLocale(
                  msg.latest_message_time,
                  locale
                )}
              >
                <Avatar
                  size="md"
                  name="Lilly"
                  src="https://chatscope.io/storybook/react/assets/lilly-aj6lnGPk.svg"
                  status="available"
                />
              </Conversation>
            </Link>
          ))}
        </ConversationList>
      ) : (
        <div className="flex flex-col justify-center flex-1 h-[80vh] items-center">
          <Image
            src={"/empty-message.png"}
            alt="no notification"
            width={500}
            height={500}
            className="w-36 h-36"
          />
          <div className="font-semibold text-subtitle text-[32px]">
            No Messages Yet
          </div>
          <small className="mt-2 text-subtitle text-[16px] font-semibold">
            No messages in your chat yet
          </small>
        </div>
      )}
    </div>
  );
};

export default Page;
