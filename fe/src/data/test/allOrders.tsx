// import { OrderFilters } from "@/app/admin/orders/page";

// export interface Order {
//   orderId: string;
//   customer: string;
//   type: string;
//   date: string;
//   location: string;
//   mover: string;
//   bids: string;
//   paymentMethod: string;
//   total: string;
//   status: string;
// }

// export const allOrders = [
//   {
//     orderId: "#123456",
//     customer: "Jane Warthner",
//     type: "Local",
//     date: "Jun 12",
//     location: "Malmo",
//     mover: "Pacflytt",
//     bids: "900 SEK",
//     paymentMethod: "Debit Card",
//     total: "1,353 SEK",
//     status: "Done",
//   },
//   {
//     orderId: "#123456",
//     customer: "Jane Warthner",
//     type: "Long Distance",
//     date: "Jun 13",
//     location: "Malmo",
//     mover: "Justflytt",
//     bids: "900 SEK",
//     paymentMethod: "Debit Card",
//     total: "248 SEK",
//     status: "Failed",
//   },
//   {
//     orderId: "#123456",
//     customer: "Jane Warthner",
//     type: "Long Distance",
//     date: "Jun 13",
//     location: "Malmo",
//     mover: "Justflytt",
//     bids: "900 SEK",
//     paymentMethod: "Debit Card",
//     total: "248 SEK",
//     status: "Failed",
//   },
//   {
//     orderId: "#123456",
//     customer: "Jane Warthner",
//     type: "Abroad",
//     date: "Jun 14",
//     location: "Malmo",
//     mover: "Reflytt",
//     bids: "900 SEK",
//     paymentMethod: "Debit Card",
//     total: "8,493 SEK",
//     status: "Pending",
//   },
//   {
//     orderId: "#123456",
//     customer: "Jane Warthner",
//     type: "Local",
//     date: "Jun 12",
//     location: "Malmo",
//     mover: "Pacflytt",
//     bids: "900 SEK",
//     paymentMethod: "Debit Card",
//     total: "1,353 SEK",
//     status: "Done",
//   },
//   {
//     orderId: "#123456",
//     customer: "Jane Warthner",
//     type: "Long Distance",
//     date: "Jun 13",
//     location: "Malmo",
//     mover: "Justflytt",
//     bids: "900 SEK",
//     paymentMethod: "Debit Card",
//     total: "248 SEK",
//     status: "Failed",
//   },
//   {
//     orderId: "#123456",
//     customer: "Jane Warthner",
//     type: "Abroad",
//     date: "Jun 14",
//     location: "Malmo",
//     mover: "Reflytt",
//     bids: "900 SEK",
//     paymentMethod: "Debit Card",
//     total: "8,493 SEK",
//     status: "Pending",
//   },
//   {
//     orderId: "#123456",
//     customer: "Jane Warthner",
//     type: "Long Distance",
//     date: "Jun 13",
//     location: "Malmo",
//     mover: "Justflytt",
//     bids: "900 SEK",
//     paymentMethod: "Debit Card",
//     total: "248 SEK",
//     status: "Failed",
//   },
//   {
//     orderId: "#123456",
//     customer: "Jane Warthner",
//     type: "Local",
//     date: "Jun 12",
//     location: "Malmo",
//     mover: "Pacflytt",
//     bids: "900 SEK",
//     paymentMethod: "Debit Card",
//     total: "1,353 SEK",
//     status: "Done",
//   },
//   {
//     orderId: "#123456",
//     customer: "Jane Warthner",
//     type: "Long Distance",
//     date: "Jun 13",
//     location: "Malmo",
//     mover: "Justflytt",
//     bids: "900 SEK",
//     paymentMethod: "Debit Card",
//     total: "248 SEK",
//     status: "Failed",
//   },
//   {
//     orderId: "#123456",
//     customer: "Jane Warthner",
//     type: "Abroad",
//     date: "Jun 14",
//     location: "Malmo",
//     mover: "Reflytt",
//     bids: "900 SEK",
//     paymentMethod: "Debit Card",
//     total: "8,493 SEK",
//     status: "Pending",
//   },
//   {
//     orderId: "#123456",
//     customer: "Jane Warthner",
//     type: "Long Distance",
//     date: "Jun 13",
//     location: "Malmo",
//     mover: "Justflytt",
//     bids: "900 SEK",
//     paymentMethod: "Debit Card",
//     total: "248 SEK",
//     status: "Failed",
//   },
//   // Add more rows here following the same structure
// ];

// interface PaginatedResponse<T> {
//   data: T[];
//   total: number;
//   page: number;
//   totalPages: number;
//   pageSize: number;
//   hasMore: boolean;
// }

// export const fetchOrders = async (
//   page: number = 1,
//   pageSize: number = 10,
//   searchQuery: string = "",
//   filters: Filters
// ): Promise<PaginatedResponse<Order>> => {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 500));

//   let filteredOrders = [...allOrders];
//   // console.log("filters", filters);

//   // Apply filters first
//   if (filters) {
//     filteredOrders = filteredOrders.filter((order) => {
//       return (
//         (!filters.orderType || order.type === filters.orderType) &&
//         (!filters.orderStatus || order.status === filters.orderStatus) &&
//         (!filters.orderLocation || order.location === filters.orderLocation) &&
//         (!filters.startDate || new Date(order.date) >= filters.startDate) &&
//         (!filters.endDate || new Date(order.date) <= filters.endDate)
//       );
//     });
//   }

//   // Then apply search
//   if (searchQuery) {
//     const query = searchQuery.toLowerCase();
//     filteredOrders = filteredOrders.filter((order) =>
//       [order.customer, order.orderId, order.location, order.mover].some(
//         (field) => field.toLowerCase().includes(query)
//       )
//     );
//   }

//   // Calculate pagination values
//   const totalItems = filteredOrders.length;
//   const totalPages = Math.ceil(totalItems / pageSize);
//   const validPage = Math.max(1, Math.min(page, totalPages));
//   const start = (validPage - 1) * pageSize;
//   const end = start + pageSize;

//   // Slice the data for current page
//   const paginatedData = filteredOrders.slice(start, end);

//   return {
//     data: paginatedData,
//     total: totalItems,
//     page: validPage,
//     totalPages,
//     pageSize,
//     hasMore: validPage < totalPages,
//   };
// };

// // Optional: Add more mock API functions
// export const getOrderById = async (orderId: string): Promise<Order | null> => {
//   await new Promise((resolve) => setTimeout(resolve, 200));
//   return allOrders.find((order) => order.orderId === orderId) || null;
// };
