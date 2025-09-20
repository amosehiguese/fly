export interface MockUserDisputes {
  id: string;
  status: "Resolved" | "Pending";
  reason: string;
  updatedOn: string;
}

export const mockUserDisputes: MockUserDisputes[] = [
  {
    id: "123456",
    status: "Resolved",
    reason: "Items arrived damaged",
    updatedOn: "18 Dec, 2024",
  },
  {
    id: "123456",
    status: "Pending",
    reason: "Items arrived damaged",
    updatedOn: "18 Dec, 2024",
  },
  {
    id: "123456",
    status: "Resolved",
    reason: "Items arrived damaged",
    updatedOn: "18 Dec, 2024",
  },
];
