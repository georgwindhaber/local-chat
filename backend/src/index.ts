import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import type { Context } from "hono";
import { dbOperations, type Message } from "./db.js";

const app = new Hono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

// Track all connected WebSocket clients
const clients = new Set<any>();

// Broadcast message to all connected clients
function broadcastMessage(message: Message) {
  const messageJson = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.raw && client.raw.readyState === 1) {
      // WebSocket.OPEN = 1
      client.raw.send(messageJson);
    } else if (client.readyState === 1) {
      client.send(messageJson);
    }
  });
}

// WebSocket route for chat
app.get(
  "/chat",
  upgradeWebSocket((c) => {
    return {
      onOpen(event, ws) {
        console.log("WebSocket connection opened");
        clients.add(ws);

        // Get the raw WebSocket if available
        const rawWs = (ws as any).raw || ws;

        // Send all previous messages to the newly connected client
        const messages = dbOperations.getAllMessages();
        messages.forEach((message) => {
          if (rawWs.readyState === 1) {
            // WebSocket.OPEN = 1
            rawWs.send(JSON.stringify(message));
          }
        });
      },
      onMessage(event, ws) {
        try {
          const data = event.data;

          // Only handle string data (JSON or plain text)
          if (typeof data !== "string") {
            console.error(
              "Unsupported message type - only string messages are supported"
            );
            return;
          }

          let messageData: {
            username?: string;
            content?: string;
            image?: string;
          };

          // Try to parse as JSON, fallback to plain text
          try {
            messageData = JSON.parse(data);
          } catch {
            // If not JSON, treat as plain text
            messageData = { content: data };
          }

          // Extract username, content and image from message data
          // Image should be sent as base64 string (e.g., "data:image/png;base64,...")
          const username = messageData.username || "Anonymous";
          const content = messageData.content || null;
          const image = messageData.image || null;

          // Validate that at least one field is present
          if (!content && !image) {
            console.error("Message must have either content or image");
            return;
          }

          // Save message to database
          const savedMessage = dbOperations.insertMessage(
            username,
            content,
            image
          );
          console.log("Message saved:", savedMessage);

          // Broadcast to all clients
          broadcastMessage(savedMessage);
        } catch (error) {
          console.error("Error processing message:", error);
        }
      },
      onClose(event, ws) {
        console.log("WebSocket connection closed");
        clients.delete(ws);
      },
      onError(event, ws) {
        console.error("WebSocket error:", event);
        clients.delete(ws);
      },
    };
  })
);

// Health check route
app.get("/", (c: Context) => {
  return c.json({ message: "Hono server with WebSocket chat is running" });
});

// Get message history endpoint
app.get("/messages", (c: Context) => {
  const messages = dbOperations.getAllMessages();
  return c.json(messages);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

const server = serve({
  fetch: app.fetch,
  port,
});
injectWebSocket(server);
