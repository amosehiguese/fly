import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface FileUploaderProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
}

type FileUploaderTranslations = {
  dropFilesHere: string;
  maxFilesReached: string;
  dragAndDropFiles: string;
  supportedFormats: string;
  errorFileLimit: string;
  errorFileSize: string;
  uploadedFiles: string;
  removeFiles: string;
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = {
    "image/jpeg": [],
    "image/png": [],
    "application/pdf": [],
  },
}) => {
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("common.fileUpload");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);

      // Check if adding new files would exceed the limit
      if (value.length + acceptedFiles.length > maxFiles) {
        setError(`You can only upload a maximum of ${maxFiles} files`);
        // Only add files up to the limit
        const remainingSlots = maxFiles - value.length;
        if (remainingSlots <= 0) return;

        acceptedFiles = acceptedFiles.slice(0, remainingSlots);
      }

      // Check file sizes
      const oversizedFiles = acceptedFiles.filter(
        (file) => file.size > maxSize
      );
      if (oversizedFiles.length > 0) {
        setError(
          `Some files exceed the maximum size of ${maxSize / (1024 * 1024)}MB`
        );
        // Filter out oversized files
        acceptedFiles = acceptedFiles.filter((file) => file.size <= maxSize);
      }

      onChange([...value, ...acceptedFiles]);
    },
    [value, onChange, maxFiles, maxSize]
  );

  const removeFile = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange(newFiles);
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-gray-300 hover:border-primary"
        } ${value.length >= maxFiles ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-gray-500" />
          <p className="text-sm text-gray-500">
            {isDragActive
              ? t("dropFilesHere")
              : value.length >= maxFiles
                ? t("maxFilesReached", { maxFiles })
                : t("dragAndDropFiles", {
                    currentFiles: value.length,
                    maxFiles: maxFiles,
                  })}
          </p>
          <p className="text-xs text-gray-400">
            {t("supportedFormats", { maxSize: maxSize / (1024 * 1024) })}
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {t("uploadedFiles", { currentFiles: value.length, maxFiles })}
          </p>
          <ul className="space-y-2">
            {value.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <FileIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">{t("removeFiles")}</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
