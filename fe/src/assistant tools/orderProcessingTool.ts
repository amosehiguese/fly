import { ToolConfig } from "./allTools";
import { fetchOrders } from "@/api/admin";
import { OrdersResponse } from "@/api/interfaces/admin/order";
import { OrderFilters } from "@/app/admin/orders/page";

interface OrderProcessingArgs {
  currentPage: number;
  searchQuery?: string;
  filters?: OrderFilters;
}

export const orderProcessingTool: ToolConfig<OrderProcessingArgs> = {
  definition: {
    type: "function",
    function: {
      name: "process_orders",
      description: "Fetch and process orders from the backend.",
      parameters: {
        type: "object",
        properties: {
          currentPage: {
            type: "number",
            description: "The current page number for pagination.",
          },
          searchQuery: {
            type: "string",
            description: "Optional search query to filter orders.",
          },
          filters: {
            type: "object",
            description: "Optional filters to apply to the orders.",
            properties: {
              orderStatus: { type: "string" },
              date: { type: "string" },
              quotationType: { type: "string" },
            },
          },
        },
        required: ["currentPage"],
      },
    },
  },
  handler: async ({
    currentPage,
    searchQuery,
    filters,
  }: OrderProcessingArgs) => {
    try {
      const orders: OrdersResponse = await fetchOrders(
        currentPage,
        searchQuery,
        filters
      );
      // Process the orders data as needed
      //   const processedData = orders.data.map(order => ({
      //     id: order.id,
      //     status: order.status,
      //     date: order.date,
      //     total: order.total,
      //   }));

      console.log("Orders processed successfully:", orders);

      return JSON.stringify(orders);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error processing orders: ${error.message}`);
        throw new Error(`Order processing failed: ${error.message}`);
      } else {
        console.error("Unknown error during order processing.");
        throw new Error("Order processing failed: Unknown error.");
      }
    }
  },
};
