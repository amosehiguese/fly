import * as z from "zod";

export const disputeSchema = z.object({
  order_id: z.string(),
  issue_type: z.enum(["damaged", "missing", "delay"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  desired_resolution: z.enum([
    "refund",
    "replacement",
    "repair",
    "compensation",
    "order_cancellation",
    "reschedule_delivery",
  ]),
  confirmation: z.boolean().refine((val) => val === true, {
    message: "You must confirm the information is accurate",
  }),
});

export type DisputeForm = z.infer<typeof disputeSchema>;
