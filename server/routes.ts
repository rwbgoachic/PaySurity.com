import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateSitemap } from "./sitemap";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Authentication Routes
  setupAuth(app);

  // API Routes
  app.get("/api/healthcheck", (req, res) => {
    res.json({ status: "ok" });
  });

  // Serve documentation files
  app.use('/docs', express.static(path.join(process.cwd(), 'docs')));
  
  // Direct BRD document access
  app.get('/api/brd', (req, res) => {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="PaySurity_Business_Requirements_Document.xlsx"');
    res.sendFile(path.join(process.cwd(), 'docs/PaySurity_Business_Requirements_Document.xlsx'));
  });

  // Sitemap for SEO
  app.get("/sitemap.xml", generateSitemap);

  // WebSocket for real-time notifications
  const httpServer = createServer(app);
  
  interface ExtendedWebSocket extends WebSocket {
    userId?: number;
    channels?: string[];
  }

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: ExtendedWebSocket) => {
    ws.channels = [];

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'subscribe' && data.channel) {
          if (!ws.channels) ws.channels = [];
          if (!ws.channels.includes(data.channel)) {
            ws.channels.push(data.channel);
            ws.send(JSON.stringify({ type: 'subscribed', channel: data.channel }));
          }
        } else if (data.type === 'unsubscribe' && data.channel) {
          if (ws.channels) {
            ws.channels = ws.channels.filter(ch => ch !== data.channel);
            ws.send(JSON.stringify({ type: 'unsubscribed', channel: data.channel }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    // Clean up on disconnect
    ws.on('close', () => {
      // Clear any resources or remove from any tracking
    });
  });

  // Broadcast helper function
  const broadcast = (channel: string, data: any) => {
    wss.clients.forEach((client) => {
      const extClient = client as ExtendedWebSocket;
      if (extClient.readyState === WebSocket.OPEN && extClient.channels?.includes(channel)) {
        extClient.send(JSON.stringify(data));
      }
    });
  };

  return httpServer;
}