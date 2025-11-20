import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../chat.db.json");

export interface Message {
  id: number;
  content: string | null;
  image: string | null;
  timestamp: number;
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
      return JSON.parse(data);
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
  insertMessage(content: string | null, image: string | null): Message {
    const timestamp = Date.now();
    const message: Message = {
      id: db.nextId++,
      content,
      image,
      timestamp,
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
