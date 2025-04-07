import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, X, Upload, FileImage, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReceiptUploadProps {
  onFileSelected: (file: File) => void;
  onRemoveFile: () => void;
  existingImageUrl?: string | null;
  previewUrl?: string | null;
  isLoading?: boolean;
  error?: string;
}

export function ReceiptUpload({
  onFileSelected,
  onRemoveFile,
  existingImageUrl,
  previewUrl,
  isLoading = false,
  error,
}: ReceiptUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = previewUrl || existingImageUrl;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  };

  const validateAndProcessFile = (file: File) => {
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPEG, PNG, etc.)");
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    onFileSelected(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <Input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={isLoading}
      />

      {!displayUrl ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          {isLoading ? (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Uploading receipt...</p>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="font-medium text-base mb-1">Upload Receipt</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Drag & drop a receipt image or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: JPEG, PNG, GIF (Max 5MB)
              </p>
              {error && (
                <div className="mt-4 flex items-center text-destructive gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs">{error}</span>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="p-4 pb-0">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Receipt Image</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onRemoveFile}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              {existingImageUrl ? "Saved receipt" : "Preview (not yet saved)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="relative rounded-md overflow-hidden border aspect-[4/3] flex items-center justify-center bg-muted">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                </div>
              ) : displayUrl ? (
                <img
                  src={displayUrl}
                  alt="Receipt"
                  className="object-contain w-full h-full"
                />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <FileImage className="h-10 w-10 mb-2" />
                  <span className="text-sm">No image available</span>
                </div>
              )}
            </div>
            {error && (
              <div className="mt-2 flex items-center text-destructive gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs">{error}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleButtonClick}
              disabled={isLoading}
            >
              Replace Image
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}