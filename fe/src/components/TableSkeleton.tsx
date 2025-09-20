import * as React from "react";
import { Skeleton } from "./ui/skeleton";

interface TableSkeletonProps {
  rows: number;
  columns: number;
}

export function TableSkeleton({ rows, columns }: TableSkeletonProps) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          {[...Array(columns)].map((_, i) => (
            <th key={i} className="p-2">
              <Skeleton className="md:w-24 w-12 h-8 bg-gray-300" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(rows)].map((_, i) => (
          <tr key={i}>
            {[...Array(columns)].map((_, j) => (
              <td key={j} className="p-2">
                <Skeleton className="md:w-24 w-12 h-8 bg-gray-300" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
