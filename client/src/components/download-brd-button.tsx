import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DownloadBRDButton() {
  const { toast } = useToast();

  const handleDownload = () => {
    // Get the current origin for the correct URL
    const origin = window.location.origin;
    const downloadUrl = `${origin}/api/brd`;
    
    // Create an invisible anchor element to trigger the download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'PaySurity_Business_Requirements_Document.xlsx';
    
    // Append to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your Business Requirements Document is downloading."
    });
  };

  return (
    <Button 
      onClick={handleDownload}
      className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
    >
      <Download className="h-4 w-4" />
      Download BRD
    </Button>
  );
}