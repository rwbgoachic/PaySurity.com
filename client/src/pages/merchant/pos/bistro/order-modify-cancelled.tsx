import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function OrderModifyCancelledPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Extract orderNumber from URL
    const params = new URLSearchParams(window.location.search);
    const number = params.get('orderNumber');
    if (number) {
      setOrderNumber(number);
    }

    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Automatically close the window after countdown
      window.close();
    }
  }, [countdown]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-amber-100 rounded-full p-3">
              <AlertCircle className="h-12 w-12 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Modifications Cancelled</CardTitle>
          <CardDescription className="text-center">
            No changes were made to order #{orderNumber}.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            Your original order remains unchanged and is still being processed by the restaurant.
          </p>
          <div className="bg-muted p-4 rounded-md">
            <p className="font-medium">Your order is safe!</p>
            <p className="text-sm text-muted-foreground mt-1">
              If you need further assistance, please contact the restaurant directly.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button 
            className="w-full" 
            onClick={() => window.close()}
          >
            Close ({countdown})
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-4">
            This window will close automatically in {countdown} seconds.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}