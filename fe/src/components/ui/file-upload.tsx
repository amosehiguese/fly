"use client";

import React, { useCallback } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "./button";

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFilesSelected: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  selectedFiles: File[];
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      className,
      onFilesSelected,
      onFileRemove,
      selectedFiles,
      maxFiles = 5,
      maxSizeMB = 25,
      ...props
    },
    ref
  ) => {
    const handleFileChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const totalFiles = selectedFiles.length + files.length;

        if (totalFiles > maxFiles) {
          alert(`You can only upload up to ${maxFiles} files.`);
          return;
        }

        const totalSizeMB = files.reduce(
          (acc, file) => acc + file.size / (1024 * 1024),
          selectedFiles.reduce(
            (acc, file) => acc + file.size / (1024 * 1024),
            0
          )
        );

        if (totalSizeMB > maxSizeMB) {
          alert(`Total file size cannot exceed ${maxSizeMB}MB.`);
          return;
        }

        const validFiles = files.filter((file) =>
          file.type.startsWith("image/")
        );

        if (validFiles.length !== files.length) {
          alert("Please upload only image files.");
          return;
        }

        onFilesSelected(validFiles);
        event.target.value = ""; // Reset input
      },
      [maxFiles, maxSizeMB, onFilesSelected, selectedFiles]
    );

    return (
      <div className="space-y-4">
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className={cn(
            "file:mr-4 file:py-2 file:px-4 h-12 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90",
            className
          )}
          ref={ref}
          {...props}
        />
        {selectedFiles.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative group aspect-square rounded-lg overflow-hidden border"
              >
                <Image
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 bg-white/80 hover:bg-white"
                    onClick={() => onFileRemove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <span className="absolute bottom-1 left-1 right-1 text-xs text-white truncate px-1">
                    {file.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";

export { FileUpload };
