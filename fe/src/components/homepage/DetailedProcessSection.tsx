"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProcessStep {
  title: string;
  description: string;
}

interface DetailedProcessSectionProps {
  title: string;
  subtitle?: string;
  steps: ProcessStep[];
}

const DetailedProcessSection: React.FC<DetailedProcessSectionProps> = ({
  title,
  subtitle,
  steps,
}) => {
  // Basic check to ensure steps data is valid
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-6xl py-12 md:py-16 lg:py-20 px-4 md:px-6">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12">
            {subtitle}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  {/* You might want a different icon or numbering */}
                  <span className="text-lg font-bold">{index + 1}</span>
                </div>
                <CardTitle className="text-lg font-semibold">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DetailedProcessSection;
