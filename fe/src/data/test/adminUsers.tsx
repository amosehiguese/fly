export const adminUsers = [
  {
    no: "01",
    name: "Jane Doe",
    email: "jane@flyttman.com",
    phone: "+46123456 789",
    role: "Super Admin",
    status: "Active",
  },
  {
    no: "02",
    name: "Jane Doe",
    email: "jane@flyttman.com",
    phone: "+46123456 789",
    role: "Support Admin",
    status: "Active",
  },
  {
    no: "03",
    name: "Jane Doe",
    email: "jane@flyttman.com",
    phone: "+46123456 789",
    role: "Financial Admin",
    status: "Inactive",
  },
  {
    no: "04",
    name: "Jane Doe",
    email: "jane@flyttman.com",
    phone: "+46123456 789",
    role: "Financial Admin",
    status: "Active",
  },
  {
    no: "05",
    name: "Jane Doe",
    email: "jane@flyttman.com",
    phone: "+46123456 789",
    role: "Support Admin",
    status: "Inactive",
  },
  {
    no: "06",
    name: "Jane Doe",
    email: "jane@flyttman.com",
    phone: "+46123456 789",
    role: "Financial Admin",
    status: "Active",
  },
  {
    no: "07",
    name: "Jane Doe",
    email: "jane@flyttman.com",
    phone: "+46123456 789",
    role: "Financial Admin",
    status: "Inactive",
  },
  {
    no: "08",
    name: "Jane Doe",
    email: "jane@flyttman.com",
    phone: "+46123456 789",
    role: "Support Admin",
    status: "Inactive",
  },
  {
    no: "09",
    name: "Jane Doe",
    email: "jane@flyttman.com",
    phone: "+46123456 789",
    role: "Financial Admin",
    status: "Active",
  },
  {
    no: "10",
    name: "Jane Doe",
    email: "jane@flyttman.com",
    phone: "+46123456 789",
    role: "Financial Admin",
    status: "Active",
  },
  {
    no: "11",
    name: "Jane Doe",
    email: "jane@flyttman.com",
    phone: "+46123456 789",
    role: "Support Admin",
    status: "Active",
  },
];

export interface AdminUser {
  no: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface AdminFilters {
  role: string;
  status: string;
}

export const defaultAdminFilters: AdminFilters = {
  role: "",
  status: "",
};

export const fetchAdminUsers = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery: string = "",
  filters?: AdminFilters
): Promise<PaginatedResponse<AdminUser>> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filteredUsers = [...adminUsers];

  // Apply filters
  if (filters) {
    filteredUsers = filteredUsers.filter((user) => {
      return (
        (!filters.role || user.role === filters.role) &&
        (!filters.status || user.status === filters.status)
      );
    });
  }

  // Apply search
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
  }

  // Calculate pagination
  const total = filteredUsers.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedUsers = filteredUsers.slice(start, end);

  return {
    data: paginatedUsers,
    total,
  };
};
