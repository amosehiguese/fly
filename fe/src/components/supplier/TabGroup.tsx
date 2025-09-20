import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  value: string;
  count?: number;
}

interface TabGroupProps {
  tabs: Tab[];
  activeTab: string;
  className?: string;
  onTabChange?: (value: string) => void;
}

export function TabGroup({
  tabs,
  activeTab,
  className,
  onTabChange,
}: TabGroupProps) {
  return (
    <div
      className={cn(
        "flex space-x-4 overflow-x-auto whitespace-nowrap no-scrollbar items-center rounded-lg p-1",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange?.(tab.value)}
          className={cn(
            "inline-flex items-center font-semibold justify-center rounded-[10px] px-3 py-2 text-sm transition-all",
            activeTab === tab.value
              ? "bg-red-500 shadow text-white"
              : "text-gray-500 border border-[#D9D9D9] hover:text-gray-900"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "ml-2 rounded-full px-2 py-0.5 text-xs",
                activeTab === tab.value
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-700"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
