import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AutoBidState {
  autoBidState: boolean;
  toggleAutoBid: () => void;
}

const useBidStore = create<AutoBidState>()(
  persist(
    (set) => ({
      autoBidState: true,
      toggleAutoBid: () =>
        set((state) => ({
          autoBidState: !state.autoBidState,
        })),
    }),
    {
      name: "auto-bid-storage",
    }
  )
);

export default useBidStore;
