import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminInitiateConversation,
  useInitiateConversation,
} from "@/hooks/useChat";
import {
  AdminInitiateConversationRequest,
  InitiateConversationRequest,
} from "@/api/interfaces/chats";
import { useTranslations } from "next-intl";
interface InitiateChatButtonProps {
  isAdmin?: boolean;
  recipientType?: "customer" | "supplier" | "admin" | "driver";
  recipientId?: number;
  senderType?: "customer" | "supplier" | "driver";
  onSuccess?: (chatId: number) => void;
}

export function InitiateChatButton({
  isAdmin = false,
  recipientType = "customer",
  recipientId,
  senderType,
}: InitiateChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    reason: "",
    priority: "normal",
    recipient_type: recipientType,
    recipient_id: recipientId?.toString() || "",
  });
  const tCommon = useTranslations("common");

  const { mutate: initiateConversation, isPending: isIniatePending } =
    useInitiateConversation(senderType || "customer");
  const { mutate: initiateAdminConversation, isPending: isAdminIniatePending } =
    useAdminInitiateConversation();

  console.log("tt", tCommon.raw("chats.reasonList")[0].name);
  const reasons = isAdmin
    ? [
        {
          id: "payment_follow_up",
          name: tCommon.raw("chats.reasonList")[3].name,
        },
        {
          id: "getting_order_status",
          name: tCommon.raw("chats.reasonList")[4].name,
        },
        {
          id: "account_issue",
          name: tCommon.raw("chats.reasonList")[1].name,
        },
        {
          id: "other",
          name: tCommon.raw("chats.reasonList")[9].name,
        },
      ]
    : senderType === "driver"
      ? [
          {
            id: "blockage_on_the_way",
            name: tCommon.raw("chats.reasonList")[8].name,
          },
          {
            id: "ask_about_an_order",
            name: tCommon.raw("chats.reasonList")[5].name,
          },
          {
            id: "traffic_jam",
            name: tCommon.raw("chats.reasonList")[6].name,
          },
          {
            id: "delivery_delay",
            name: tCommon.raw("chats.reasonList")[7].name,
          },
          {
            id: "other",
            name: tCommon.raw("chats.reasonList")[9].name,
          },
        ]
      : [
          {
            id: "payment_issue",
            name: tCommon.raw("chats.reasonList")[0].name,
          },
          {
            id: "dispute_on_an_order",
            name: tCommon.raw("chats.reasonList")[2].name,
          },
          {
            id: "payment_follow_up",
            name: tCommon.raw("chats.reasonList")[3].name,
          },
          {
            id: "getting_order_status",
            name: tCommon.raw("chats.reasonList")[4].name,
          },
          {
            id: "ask_about_an_order",
            name: tCommon.raw("chats.reasonList")[5].name,
          },
        ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = isAdmin
      ? {
          recipient_type: formData.recipient_type,
          recipient_id: Number(formData.recipient_id),
          reason: formData.reason,
        }
      : senderType === "driver"
        ? {
            recipient_type: "supplier",
            recipient_id: recipientId,
            reason: formData.reason,
          }
        : {
            recipient_type: "admin",
            recipient_id: recipientId,
            reason: formData.reason,
            priority: formData.priority,
          };

    if (isAdmin) {
      initiateAdminConversation(payload as AdminInitiateConversationRequest);
    } else {
      initiateConversation(payload as InitiateConversationRequest);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="dark:text-white">
          {isIniatePending || isAdminIniatePending
            ? tCommon("chats.buttons.initiating")
            : `${tCommon("chats.buttons.message")} ${tCommon(`chats.recipient.${recipientType}`)}`}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isAdmin
              ? tCommon("chats.buttons.messageCustomerSupplier")
              : tCommon("chats.buttons.startConversation")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reason Selection */}
          <div className="space-y-2">
            <Label>{tCommon("labels.reason")}</Label>
            <Select
              value={formData.reason}
              onValueChange={(value) =>
                setFormData({ ...formData, reason: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={tCommon("labels.selectReason")} />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((reason) => (
                  <SelectItem key={reason.id} value={reason.id}>
                    {reason.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Admin-specific Fields */}
          {isAdmin && (
            <>
              <div className="space-y-2">
                <Label>{tCommon("labels.recipientType")}</Label>
                <Select
                  value={formData.recipient_type}
                  disabled
                  onValueChange={(value: "customer" | "supplier" | "admin") =>
                    setFormData({ ...formData, recipient_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">
                      {tCommon("accountType.customer")}
                    </SelectItem>
                    <SelectItem value="supplier">
                      {tCommon("accountType.supplier")}
                    </SelectItem>
                    <SelectItem value="admin">
                      {tCommon("accountType.admin")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{tCommon("labels.recipientId")}</Label>
                <input
                  type="number"
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.recipient_id}
                  onChange={(e) =>
                    setFormData({ ...formData, recipient_id: e.target.value })
                  }
                  required
                />
              </div>
            </>
          )}

          {/* Customer-specific Priority */}
          {!isAdmin && (
            <div className="space-y-2">
              <Label>{tCommon("labels.priority")}</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{tCommon("labels.low")}</SelectItem>
                  <SelectItem value="normal">
                    {tCommon("labels.normal")}
                  </SelectItem>
                  <SelectItem value="high">{tCommon("labels.high")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            disabled={
              isIniatePending || isAdminIniatePending || !formData.reason
            }
            type="submit"
            className="w-full"
          >
            {isIniatePending || isAdminIniatePending
              ? tCommon("chats.buttons.initiating")
              : tCommon("chats.buttons.startConversation")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
