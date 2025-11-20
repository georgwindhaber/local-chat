import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../chat.db.json");

export interface Reaction {
  emoji: string;
  usernames: string[];
}

export interface Message {
  id: number;
  username: string;
  content: string | null;
  image: string | null;
  timestamp: number;
  reactions?: Record<string, string[]>; // emoji -> array of usernames
}

interface Database {
  messages: Message[];
  nextId: number;
}

// Load database from file
function loadDatabase(): Database {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, "utf-8");
      const db = JSON.parse(data);

      // Migrate old messages without username or reactions field
      if (db.messages && Array.isArray(db.messages)) {
        db.messages = db.messages.map((msg: any) => {
          if (!msg.username) {
            msg.username = "Anonymous";
          }
          if (!msg.reactions) {
            msg.reactions = {};
          }
          return msg;
        });
      }

      return db;
    }
  } catch (error) {
    console.error("Error loading database:", error);
  }
  return { messages: [], nextId: 1 };
}

// Save database to file
function saveDatabase(data: Database) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving database:", error);
  }
}

// Initialize database
let db: Database = loadDatabase();

// Auto-save every 5 seconds
setInterval(() => {
  saveDatabase(db);
}, 5000);

export const dbOperations = {
  // Insert a new message
  insertMessage(
    username: string,
    content: string | null,
    image: string | null
  ): Message {
    const timestamp = Date.now();
    const message: Message = {
      id: db.nextId++,
      username,
      content,
      image,
      timestamp,
      reactions: {},
    };

    db.messages.push(message);
    saveDatabase(db);

    return message;
  },

  // Get all messages
  getAllMessages(): Message[] {
    return [...db.messages].sort((a, b) => a.timestamp - b.timestamp);
  },

  // Get messages after a specific timestamp
  getMessagesAfter(timestamp: number): Message[] {
    return db.messages
      .filter((msg) => msg.timestamp > timestamp)
      .sort((a, b) => a.timestamp - b.timestamp);
  },

  // Add or remove a reaction
  toggleReaction(
    messageId: number,
    emoji: string,
    username: string
  ): Message | null {
    const message = db.messages.find((m) => m.id === messageId);
    if (!message) return null;

    if (!message.reactions) {
      message.reactions = {};
    }

    if (!message.reactions[emoji]) {
      message.reactions[emoji] = [];
    }

    const index = message.reactions[emoji].indexOf(username);
    if (index > -1) {
      // Remove reaction
      message.reactions[emoji].splice(index, 1);
      if (message.reactions[emoji].length === 0) {
        delete message.reactions[emoji];
      }
    } else {
      // Add reaction
      message.reactions[emoji].push(username);
    }

    saveDatabase(db);
    return message;
  },
};

// Save database on process exit
process.on("exit", () => {
  saveDatabase(db);
});

process.on("SIGINT", () => {
  saveDatabase(db);
  process.exit(0);
});

process.on("SIGTERM", () => {
  saveDatabase(db);
  process.exit(0);
});
