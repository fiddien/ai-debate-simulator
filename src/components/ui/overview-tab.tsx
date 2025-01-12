import { Button } from "@/ui/button";
import { MessageSquare } from "lucide-react";
import { ReactNode } from "react";

export interface OverviewItem {
  id: string;
  title: string;
  content: ReactNode;
  onClick?: () => void;
}

interface OverviewTabProps {
  items: OverviewItem[];
  emptyMessage?: string;
}

export function OverviewTab({ items, emptyMessage }: OverviewTabProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <MessageSquare className="mr-2" />
        {emptyMessage || "No items to display"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="p-4 border rounded-lg bg-white hover:cursor-pointer hover:bg-teal-50"
          onClick={item.onClick}
        >
          <h3 className="font-medium mb-2">{item.title}</h3>
          <div className="text-sm text-gray-600 line-clamp-2">{item.content}</div>
        </div>
      ))}
    </div>
  );
}
