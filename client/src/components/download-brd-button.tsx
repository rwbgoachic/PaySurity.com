import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export function DownloadBRDButton() {
  const handleDownload = () => {
    // Creating a fetch request to get the file
    fetch('/docs/PaySurity_Business_Requirements_Document.xlsx')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create an anchor element
        const a = document.createElement('a');
        a.href = url;
        a.download = 'PaySurity_Business_Requirements_Document.xlsx';
        
        // Append to the document
        document.body.appendChild(a);
        
        // Trigger a click on the element
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => {
        console.error('Error downloading the file:', error);
        alert('There was an error downloading the file. Please try again later.');
      });
  };

  return (
    <Button 
      onClick={handleDownload}
      className="flex items-center gap-2"
    >
      <FileDown className="h-4 w-4" />
      <span>Download Business Requirements Document</span>
    </Button>
  );
}