import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Link as LinkIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface OrderModificationQRCodeProps {
  orderId: number;
  orderNumber: string;
  tableName?: string;
}

export function OrderModificationQRCode({ orderId, orderNumber, tableName }: OrderModificationQRCodeProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [modificationUrl, setModificationUrl] = useState<string>('');
  const [expiryMinutes, setExpiryMinutes] = useState(30);
  const { toast } = useToast();

  const generateModificationLink = async () => {
    try {
      setIsGenerating(true);
      
      const response = await apiRequest('POST', `/api/orders/${orderId}/modification-link`, {
        expiryMinutes
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate modification link');
      }
      
      const data = await response.json();
      setModificationUrl(data.url);
      
      toast({
        title: 'Modification link generated',
        description: `Link will expire in ${expiryMinutes} minutes`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate modification link',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(modificationUrl);
    toast({
      title: 'Link copied',
      description: 'Order modification link has been copied to clipboard',
    });
  };

  const sendViaText = async () => {
    try {
      const response = await apiRequest('POST', `/api/orders/${orderId}/send-modification`, {
        url: modificationUrl
      });
      
      if (!response.ok) {
        throw new Error('Failed to send text message');
      }
      
      toast({
        title: 'Text message sent',
        description: 'Order modification link has been sent via SMS',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send text message',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Order Modification QR Code</CardTitle>
        <CardDescription>
          Order #{orderNumber} {tableName && `at ${tableName}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {modificationUrl ? (
          <div className="flex flex-col items-center">
            <div className="bg-white p-3 rounded-lg border">
              <QRCode value={modificationUrl} size={200} />
            </div>
            <p className="text-xs mt-2 text-muted-foreground">
              Scan this code to modify the order
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="expiry-minutes">Expiry Time (minutes)</Label>
              <Input
                id="expiry-minutes"
                type="number"
                min="5"
                max="60"
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(parseInt(e.target.value) || 30)}
                className="mt-1"
              />
            </div>
            <Button
              className="w-full"
              onClick={generateModificationLink}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Modification QR Code"
              )}
            </Button>
          </div>
        )}
        
        {modificationUrl && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2">
              <Input 
                value={modificationUrl} 
                readOnly 
                className="font-mono text-xs"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={copyToClipboard}
                className="flex-shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={sendViaText}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Send via Text Message
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        {modificationUrl && (
          <Button
            variant="outline"
            onClick={() => setModificationUrl('')}
            className="w-full"
          >
            Generate New Code
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default OrderModificationQRCode;