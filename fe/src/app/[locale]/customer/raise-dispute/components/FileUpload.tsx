import { X, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface FileUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export const FileUpload = ({
  files,
  setFiles,
  maxFiles = 3,
  maxSize = 5, // 5MB default
}: FileUploadProps) => {
  const [error, setError] = useState<string>("");
  const tButton = useTranslations("common.buttons");
  const tLabel = useTranslations("common.labels");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Check number of files
      if (files.length + newFiles.length > maxFiles) {
        setError(tLabel("maxFilesError", { maxFiles }));
        return;
      }

      // Check file sizes
      const oversizedFiles = newFiles.filter(
        (file) => file.size > maxSize * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        setError(tLabel("oversizedFilesError", { maxSize }));
        return;
      }

      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 sm:h-14 bg-primary text-white hover:bg-primary/[0.9] text-base sm:text-lg"
        onClick={() => document.getElementById("file-upload")?.click()}
        disabled={files.length >= maxFiles}
      >
        <Upload className="mr-2 h-5 w-5" />
        {files.length >= maxFiles
          ? tLabel("maximumFilesAllowed")
          : tButton("addFile")}
      </Button>
      <input
        id="file-upload"
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,.pdf"
      />

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 sm:p-3 border rounded-lg bg-gray-50 group"
          >
            <span className="text-sm sm:text-base text-gray-600">
              {file.name}
            </span>
            <button
              type="button"
              onClick={() => removeFile(index)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
