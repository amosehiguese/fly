export interface MockUserOrders {
  id: string;
  status: "Completed" | "Pending";
  from: string;
  to: string;
  dateCreated: string;
}

export const mockUserOrders: MockUserOrders[] = [
  {
    id: "12345",
    status: "Pending",
    from: "Malmö",
    to: "Stockholm",
    dateCreated: "18 November 2024",
  },
  {
    id: "12345",
    status: "Completed",
    from: "Malmö",
    to: "Stockholm",
    dateCreated: "18 November 2024",
  },
];
