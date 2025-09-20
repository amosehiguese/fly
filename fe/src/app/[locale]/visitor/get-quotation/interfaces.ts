export interface ServiceType {
  label: string;
  value: string;
  requestBody: unknown; // We'll replace 'any' with specific types later
}

export const serviceTypes: ServiceType[] = [
  {
    label: "Company Relocation",
    value: "companyrelocation",
    requestBody: {
      from_city: "",
      to_city: "",
      move_date: "",
      type_of_service: ["Company Relocation"],
      email: "",
      phone: "",
      number_of_workstations: 0,
      office_size: "",
      list_of_larger_items: [],
      equipment_disassembly: false,
      other_about_move: "",
    },
  },
  // ... other service types with their request bodies
];

export type MoveTypes = "move_whole_house" | "move_items" | unknown;
