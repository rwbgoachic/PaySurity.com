import React, { useEffect } from "react";
import { Switch, Route } from "wouter";
import { createRoot } from "react-dom/client";
import PaymentPage from "./pages/payment-page";
import PaymentSuccessPage from "./pages/payment-success-page";
import NotFound from "./pages/not-found";

function TestRouter() {
  return (
    <Switch>
      <Route path="/">
        <div>Home Page</div>
      </Route>
      <Route path="/payment">
        <PaymentPage />
      </Route>
      <Route path="/payment-success">
        <PaymentSuccessPage />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function TestApp() {
  return (
    <div>
      <TestRouter />
    </div>
  );
}

// This file is just for testing, not actually used
// createRoot(document.getElementById("root")!).render(<TestApp />);