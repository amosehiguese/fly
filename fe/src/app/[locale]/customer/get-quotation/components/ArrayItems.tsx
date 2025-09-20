interface ArrayItemsProps {
  label: string;
  items: string[];
}

export const ArrayItems = ({ label, items }: ArrayItemsProps) => (
  <div className="col-span-2">
    <p className="text-sm text-gray-500">{label}</p>
    <div className="flex flex-wrap gap-2 mt-1">
      {items.map((item, index) => (
        <span key={index} className="bg-gray-200 px-2 py-1 rounded-md text-sm">
          {item}
        </span>
      ))}
    </div>
  </div>
);
