import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileUp, Trash2, Image, Loader2 } from "lucide-react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      console.error("File must be an image");
      return;
    }

    // Check file size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error("File size must be less than 5MB");
      return;
    }

    onFileSelected(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
    // Reset the input so the same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  // Determine if we have an image to show (either existing or preview)
  const hasImage = existingImageUrl || previewUrl;

  return (
    <div className="w-full">
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isLoading}
      />

      {!hasImage ? (
        <Card
          className={cn(
            "border-2 border-dashed p-0 cursor-pointer hover:border-primary/50 transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={isLoading ? undefined : handleClick}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            {isLoading ? (
              <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mb-4" />
            ) : (
              <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
            )}
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Upload Receipt</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop your receipt image here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, or GIF up to 5MB
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="relative group">
          <Card className="overflow-hidden border-0">
            <CardContent className="p-0 relative">
              <div className="relative aspect-video bg-muted">
                <img
                  src={previewUrl || existingImageUrl || ''}
                  alt="Receipt"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleClick}
                      disabled={isLoading}
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Replace
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={onRemoveFile}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
                {isLoading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}