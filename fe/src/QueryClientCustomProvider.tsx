"use client";

import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const QueryClientCustomProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [client] = useState(
    new QueryClient({
      defaultOptions: { queries: { gcTime: 1000 * 60 * 60 * 24 } },
    })
  );

  useEffect(() => {
    const localStoragePersister = createSyncStoragePersister({
      storage: window.localStorage,
    });

    persistQueryClient({
      queryClient: client,
      persister: localStoragePersister,
    });
  }, [client]);

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
};
