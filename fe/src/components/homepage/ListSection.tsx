"use client";

import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react"; // Or another suitable icon

interface ListItem {
  title: string;
  subtitle: string; // Or description, text etc. Adjust if needed
}

interface ListSectionProps {
  title: string;
  subtitle?: string;
  items: ListItem[];
  gridCols?: string; // e.g., 'md:grid-cols-2', 'lg:grid-cols-3'
}

const ListSection: React.FC<ListSectionProps> = ({
  title,
  subtitle,
  items,
  gridCols = "md:grid-cols-2 lg:grid-cols-3", // Default grid columns
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-6xl py-12 md:py-16 lg:py-20 px-4 md:px-6 mx-auto">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
          {items.map((item, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 mt-1">
                  <Check className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold mb-1">
                    {item.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.subtitle}
                  </p>
                </div>
              </CardHeader>
              {/* <CardContent> Optionally add content here if needed */}
              {/* </CardContent> */}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ListSection;
