// analytics.ts - Tracks user interactions across the application
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'wouter';

// Interface for click events
export interface ClickEventData {
  elementId?: string;
  elementType: string;
  elementText?: string;
  pagePath: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Queue to store events before sending them to the server
let eventQueue: ClickEventData[] = [];
const QUEUE_FLUSH_INTERVAL = 10000; // 10 seconds
const MAX_QUEUE_SIZE = 20;

// Initialize the analytics system
export function initAnalytics(): void {
  // Set up periodic flushing of the event queue
  setInterval(flushEventQueue, QUEUE_FLUSH_INTERVAL);
  console.log('Analytics tracking initialized');
}

// Track a click event
export function trackClick(
  elementType: string,
  elementId?: string,
  elementText?: string,
  metadata?: Record<string, any>
): void {
  const event: ClickEventData = {
    elementId,
    elementType,
    elementText: elementText?.substring(0, 100), // Limit text length
    pagePath: window.location.pathname,
    timestamp: Date.now(),
    metadata
  };
  
  // Add to queue
  eventQueue.push(event);
  
  // Flush queue if it gets too large
  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    flushEventQueue();
  }
}

// Send accumulated events to the server
async function flushEventQueue(): Promise<void> {
  if (eventQueue.length === 0) return;
  
  const eventsToSend = [...eventQueue];
  eventQueue = []; // Clear the queue
  
  try {
    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events: eventsToSend }),
    });
    
    if (!response.ok) {
      console.error('Failed to send analytics events:', await response.text());
      // Put events back in queue
      eventQueue = [...eventsToSend, ...eventQueue];
    }
  } catch (error) {
    console.error('Error sending analytics events:', error);
    // Put events back in queue
    eventQueue = [...eventsToSend, ...eventQueue];
  }
}

// React hook for tracking clicks on any element
export function useClickTracking(
  elementType: string,
  elementId?: string,
  metadata?: Record<string, any>
): (element: HTMLElement | null) => void {
  return (element: HTMLElement | null) => {
    if (!element) return;
    
    const handleClick = (event: MouseEvent) => {
      // Extract text content
      const elementText = (event.currentTarget as HTMLElement).innerText || '';
      
      // Track the click
      trackClick(elementType, elementId, elementText, metadata);
    };
    
    useEffect(() => {
      if (element) {
        element.addEventListener('click', handleClick);
        return () => {
          element.removeEventListener('click', handleClick);
        };
      }
    }, [element]);
  };
}

// Tracked button component
export function TrackedButton(props: React.ComponentProps<typeof Button> & { trackingType?: string }) {
  const { trackingType = 'button', ...rest } = props;
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    trackClick(
      trackingType, 
      props.id as string | undefined, 
      (e.currentTarget as HTMLElement).innerText || '',
      { variant: props.variant }
    );
    
    if (props.onClick) {
      props.onClick(e);
    }
  };
  
  return React.createElement(Button, { ...rest, onClick: handleClick });
}

// Tracked accordion component
export function TrackedAccordion(props: React.ComponentProps<typeof Accordion>) {
  const handleValueChange = (value: string | string[]) => {
    trackClick('accordion', props.id as string | undefined, Array.isArray(value) ? value.join(',') : value);
    
    if (props.onValueChange) {
      props.onValueChange(value as any); // Cast to any to avoid type conflicts
    }
  };
  
  return React.createElement(Accordion, { ...props, onValueChange: handleValueChange });
}

// Tracked accordion trigger component
export function TrackedAccordionTrigger(props: React.ComponentProps<typeof AccordionTrigger>) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    trackClick(
      'accordion-trigger', 
      props.id as string | undefined, 
      (e.currentTarget as HTMLElement).innerText || ''
    );
    
    if (props.onClick) {
      props.onClick(e);
    }
  };
  
  return React.createElement(AccordionTrigger, { ...props, onClick: handleClick });
}

// Tracked link component
export function TrackedLink(props: React.ComponentProps<typeof Link>) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackClick(
      'link', 
      undefined, // Links don't have IDs in this interface
      (e.currentTarget as HTMLElement).innerText || '',
      { to: props.to || props.href }
    );
    
    if (props.onClick) {
      props.onClick(e);
    }
  };
  
  return React.createElement(Link, { ...props, onClick: handleClick });
}