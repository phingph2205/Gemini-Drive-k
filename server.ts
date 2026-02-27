import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import Database from "better-sqlite3";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

const db = new Database("drive.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    originalName TEXT NOT NULL,
    mimeType TEXT NOT NULL,
    size INTEGER NOT NULL,
    uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT DEFAULT '',
    path TEXT NOT NULL
  )
`);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use("/uploads", express.static(UPLOADS_DIR));

  // API Routes
  app.get("/api/files", (req, res) => {
    const { search, type, sort } = req.query;
    let query = "SELECT * FROM files WHERE 1=1";
    const params: any[] = [];

    if (search) {
      query += " AND (name LIKE ? OR notes LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (type && type !== "all") {
      if (type === "image") {
        query += " AND mimeType LIKE 'image/%'";
      } else if (type === "document") {
        query += " AND (mimeType LIKE 'application/pdf' OR mimeType LIKE 'text/%' OR mimeType LIKE 'application/msword' OR mimeType LIKE 'application/vnd.openxmlformats-officedocument.%')";
      } else {
        query += " AND NOT (mimeType LIKE 'image/%' OR mimeType LIKE 'application/pdf' OR mimeType LIKE 'text/%')";
      }
    }

    if (sort === "oldest") {
      query += " ORDER BY uploadDate ASC";
    } else {
      query += " ORDER BY uploadDate DESC";
    }

    const files = db.prepare(query).all(...params);
    res.json(files);
  });

  app.post("/api/files", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { name, notes } = req.body;
    const stmt = db.prepare(`
      INSERT INTO files (name, originalName, mimeType, size, path, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      name || req.file.originalname,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      req.file.filename,
      notes || ""
    );

    const newFile = db.prepare("SELECT * FROM files WHERE id = ?").get(info.lastInsertRowid);
    res.json(newFile);
  });

  app.patch("/api/files/:id", (req, res) => {
    const { id } = req.params;
    const { name, notes } = req.body;

    const stmt = db.prepare(`
      UPDATE files SET name = COALESCE(?, name), notes = COALESCE(?, notes)
      WHERE id = ?
    `);
    stmt.run(name, notes, id);

    const updatedFile = db.prepare("SELECT * FROM files WHERE id = ?").get(id);
    res.json(updatedFile);
  });

  app.delete("/api/files/:id", (req, res) => {
    const { id } = req.params;
    const file = db.prepare("SELECT path FROM files WHERE id = ?").get(id) as { path: string } | undefined;

    if (file) {
      const filePath = path.join(UPLOADS_DIR, file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      db.prepare("DELETE FROM files WHERE id = ?").run(id);
    }

    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
