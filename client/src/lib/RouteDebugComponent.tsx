import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * A debug component to help identify routing issues
 * Renders information about the current route and location
 */
export default function RouteDebugComponent() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    console.log("Current location from wouter:", location);
    console.log("Window location:", window.location.pathname + window.location.search);
  }, [location]);

  const handleGoToPayment = () => {
    setLocation('/payment?ref=ORDER123&amt=49.99&tax=5.00&total=54.99&tip=0&curr=USD&mid=MERCHANT001&ts=2023-04-09T12:00:00Z');
  };

  const handleGoToPaymentSuccess = () => {
    setLocation('/payment-success?reference=ORDER123&amount=54.99&currency=USD&merchant=MERCHANT001');
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 9999
    }}>
      <h3>Route Debugger</h3>
      <p>Current location: {location}</p>
      <div>
        <button 
          onClick={handleGoToPayment}
          style={{ 
            backgroundColor: 'blue', 
            color: 'white', 
            padding: '5px 10px', 
            margin: '5px',
            border: 'none',
            borderRadius: '3px'
          }}
        >
          Go to Payment
        </button>
        <button 
          onClick={handleGoToPaymentSuccess}
          style={{ 
            backgroundColor: 'green', 
            color: 'white', 
            padding: '5px 10px', 
            margin: '5px',
            border: 'none',
            borderRadius: '3px'
          }}
        >
          Go to Success
        </button>
      </div>
    </div>
  );
}