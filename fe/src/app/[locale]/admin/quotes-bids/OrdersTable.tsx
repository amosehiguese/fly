import {
    TableCell,
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SetStateAction } from "react";
  
  interface TableProps {
    title: string;
    headers: string[];
    cells: string[][];
    extraTableHeaders?: string[];
    extraTableColumnCells?: (row: string[], rowIndex: number) => React.ReactNode;
    showFilter?: boolean;
    setFilters?: SetStateAction<string>;
    setQuery?: SetStateAction<string> 
    // Add new prop for column styles
    columnStyles?: {
      [columnIndex: number]: (content: string) => string;
    };
  }
  
  const OrdersTable = ({
    title,
    headers,
    cells,
    extraTableColumnCells,
    extraTableHeaders = [],
    columnStyles = {},
  }: TableProps) => {
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((item, index) => (
                  <TableHead
                    className="text-black dark:text-white font-bold"
                    key={`extra-header-${index}`}
                  >
                    {item}
                  </TableHead>
                ))}
                {extraTableHeaders.map((item, index) => (
                  <TableHead
                    className="text-black dark:text-white font-bold"
                    key={`extra-header-${index}`}
                  >
                    {item}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {cells.map((row, rowIndex) => (
                <TableRow
                  className="text-subtitle font-normal  dark:text-white"
                  key={`row-${rowIndex}`}
                >
                  {row.map((cell, cellIndex) => (
                    <TableCell key={`cell-${rowIndex}-${cellIndex}`}>
                      <div
                        className={
                          columnStyles[cellIndex]
                            ? columnStyles[cellIndex](cell)
                            : undefined
                        }
                      >
                        {cell}
                      </div>
                    </TableCell>
                  ))}
                  {extraTableHeaders.length > 0 &&
                    extraTableColumnCells &&
                    extraTableColumnCells(row, rowIndex)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };
  
  export default OrdersTable;
  