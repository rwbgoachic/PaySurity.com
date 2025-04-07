import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function OrderModifySuccessPage() {
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
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Order Modified Successfully!</CardTitle>
          <CardDescription className="text-center">
            Your changes to order #{orderNumber} have been saved.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            The restaurant has been notified of your changes and will prepare your order accordingly.
          </p>
          <div className="bg-muted p-4 rounded-md">
            <p className="font-medium">Thank you for your order!</p>
            <p className="text-sm text-muted-foreground mt-1">
              You'll receive a notification when your order is ready.
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