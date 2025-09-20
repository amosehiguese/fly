import { Filters } from "@/app/admin/quotations/page";

export const allOffers = [
  {
    id: "BID-123",
    type: "Bid",
    date: "Jun 12",
    moverName: "Gamma Transport",
    location: "Malmo",
    price: "1,353 SEK",
    status: "Accepted",
  },
  {
    id: "Quo-123",
    type: "Quotation",
    date: "Jun 13",
    moverName: "Justflytt Logistics",
    location: "Stockholm",
    price: "248 SEK",
    status: "Rejected",
  },
  {
    id: "Quo-123",
    type: "Quotation",
    date: "Jun 14",
    moverName: "Reflytt Movers",
    location: "Stockholm",
    price: "8,493 SEK",
    status: "Pending",
  },
  {
    id: "BID-123",
    type: "Bid",
    date: "Jun 13",
    moverName: "Beta Transport",
    location: "Sundsvall",
    price: "248 SEK",
    status: "Rejected",
  },
  {
    id: "BID-123",
    type: "Bid",
    date: "Jun 13",
    moverName: "Beta Transport",
    location: "Sundsvall",
    price: "248 SEK",
    status: "Rejected",
  },
  {
    id: "BID-123",
    type: "Bid",
    date: "Jun 14",
    moverName: "Gamma Transport",
    location: "Sundsvall",
    price: "8,493 SEK",
    status: "Pending",
  },
  {
    id: "Quo-123",
    type: "Quotation",
    date: "Jun 13",
    moverName: "Alpha Logistics",
    location: "Stockholm",
    price: "248 SEK",
    status: "Accepted",
  },
  {
    id: "Quo-123",
    type: "Quotation",
    date: "Jun 14",
    moverName: "Reflytt Movers",
    location: "Stockholm",
    price: "8,493 SEK",
    status: "Pending",
  },
  {
    id: "Quo-123",
    type: "Quotation",
    date: "Jun 12",
    moverName: "Collon Transport",
    location: "Lulea",
    price: "1,353 SEK",
    status: "Accepted",
  },
];

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  hasMore: boolean;
}

export interface Offer {
  id: string;
  type: string;
  date: string;
  moverName: string;
  location: string;
  price: string;
  status: string;
}

export const fetchOffers = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery: string = "",
  filters?: Filters
): Promise<PaginatedResponse<Offer>> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filteredOffers = [...allOffers];

  // Apply filters
  if (filters) {
    filteredOffers = filteredOffers.filter((offer) => {
      // Parse price string (e.g., "1,353 SEK" -> 1353)
      const price = parseInt(offer.price.replace(/[^0-9]/g, ""));

      return (
        (!filters.orderType || offer.type === filters.orderType) &&
        (!filters.orderStatus || offer.status === filters.orderStatus) &&
        (!filters.orderLocation || offer.location === filters.orderLocation) &&
        (!filters.startDate || new Date(offer.date) >= filters.startDate) &&
        (!filters.endDate || new Date(offer.date) <= filters.endDate) &&
        (!filters.minPrice || price >= filters.minPrice) &&
        (!filters.maxPrice || price <= filters.maxPrice)
      );
    });
  }

  // Apply search
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredOffers = filteredOffers.filter((offer) =>
      Object.values(offer).some((value) =>
        value.toString().toLowerCase().includes(query)
      )
    );
  }

  // Calculate pagination
  const totalItems = filteredOffers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const validPage = Math.max(1, Math.min(page, totalPages));
  const start = (validPage - 1) * pageSize;
  const end = start + pageSize;

  const paginatedData = filteredOffers.slice(start, end);

  return {
    data: paginatedData,
    total: totalItems,
    page: validPage,
    totalPages,
    pageSize,
    hasMore: validPage < totalPages,
  };
};
