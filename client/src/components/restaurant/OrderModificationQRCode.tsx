import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { QRCode } from 'react-qr-code';
import { Printer, Download, Loader2 } from 'lucide-react';

interface OrderModificationQRCodeProps {
  orderId: number;
  orderNumber: string;
}

export function OrderModificationQRCode({ orderId, orderNumber }: OrderModificationQRCodeProps) {
  const [qrData, setQrData] = useState<{ qrCodeDataUrl: string; modificationUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQrCode = async () => {
      setLoading(true);
      setError(null);

      try {
        // Generate a QR code for this order
        const response = await apiRequest(
          'POST',
          `/api/restaurant/orders/${orderId}/modification-qr`,
          {}
        );

        if (!response.ok) {
          throw new Error('Failed to generate QR code');
        }

        const data = await response.json();
        setQrData(data);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      generateQrCode();
    }
  }, [orderId]);

  const handlePrint = () => {
    if (!qrData) return;

    // Create a new window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this website');
      return;
    }

    // Add content to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Order #${orderNumber} Modification QR Code</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .qr-container {
              margin: 20px auto;
              max-width: 300px;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            h2 {
              margin-bottom: 5px;
            }
            p {
              margin-top: 5px;
              color: #666;
            }
            .url {
              margin-top: 20px;
              word-break: break-all;
              font-size: 12px;
              color: #666;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <h2>Order #${orderNumber}</h2>
          <p>Scan to modify your order</p>
          <div class="qr-container">
            <img src="${qrData.qrCodeDataUrl}" alt="Order Modification QR Code" />
          </div>
          <div class="url">
            ${qrData.modificationUrl}
          </div>
          <div class="footer">
            This QR code is valid for 24 hours
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleDownload = () => {
    if (!qrData) return;

    // Create a temporary link
    const a = document.createElement('a');
    a.href = qrData.qrCodeDataUrl;
    a.download = `order-${orderNumber}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Order Modification QR Code</CardTitle>
        <CardDescription>
          Provide this QR code to the customer to allow them to modify their order
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-0">
        {loading ? (
          <Skeleton className="h-44 w-44" />
        ) : error ? (
          <div className="text-center p-4 text-destructive">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => {
                setLoading(true);
                setError(null);
                // Retry the API call
                apiRequest(
                  'POST',
                  `/api/restaurant/orders/${orderId}/modification-qr`,
                  {}
                )
                .then(response => {
                  if (!response.ok) {
                    throw new Error('Failed to generate QR code');
                  }
                  return response.json();
                })
                .then(data => {
                  setQrData(data);
                  setLoading(false);
                })
                .catch(err => {
                  console.error('Error generating QR code:', err);
                  setError(err instanceof Error ? err.message : 'Failed to generate QR code');
                  setLoading(false);
                });
              }}
            >
              Retry
            </Button>
          </div>
        ) : qrData ? (
          <div className="text-center">
            <div className="inline-block p-3 bg-white rounded-lg">
              <QRCode
                value={qrData.modificationUrl}
                size={180}
                level="H"
                fgColor="#000000"
                bgColor="#FFFFFF"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 max-w-[220px] mx-auto">
              Valid for 24 hours
            </p>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex justify-center gap-2 pt-4">
        <Button size="sm" variant="outline" disabled={!qrData || loading} onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button size="sm" variant="outline" disabled={!qrData || loading} onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}
