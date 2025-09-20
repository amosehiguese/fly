import { create } from "zustand";

interface ServiceState {
  serviceType: string;
  subType: string;
  setServiceType: (serviceType: string) => void;
  setSubType: (subType: string) => void;
}

const useVisitorServiceStore = create<ServiceState>((set) => ({
  serviceType: "",
  subType: "",
  setServiceType: (serviceType) => set({ serviceType }),
  setSubType: (subType) => set({ subType }),
}));

export default useVisitorServiceStore;
