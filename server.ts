import express from "express";
// import { createServer as createViteServer } from "vite"; // Moved to dynamic import
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
// Removed all native module imports that cause Vercel crashes

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SQLite disabled on Vercel, but enabled locally
let localDb: any = null;

const initSQLite = async () => {
  if (process.env.VERCEL) {
    console.log("Running on Vercel: SQLite storage disabled.");
    return;
  }
  
  try {
    const { default: Database } = await import('better-sqlite3');
    localDb = new Database("data.db");
    console.log("Local SQLite database initialized.");
    
    // Ensure tables exist
    localDb.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
      );
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        message TEXT,
        created_at TEXT
      );
    `);
  } catch (err) {
    console.warn("Failed to initialize local SQLite:", err);
  }
};

initSQLite();

let supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-for-dev-only';

// Normalize Supabase URL
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  if (supabaseUrl.includes('.')) {
    supabaseUrl = `https://${supabaseUrl}`;
  } else {
    supabaseUrl = `https://${supabaseUrl}.supabase.co`;
  }
}

let supabase: any;

const createMockSupabase = (errorMsg = "Supabase not configured") => {
  const mockResult = (data: any = null, error: any = { message: errorMsg }) => Promise.resolve({ data, error, count: 0 });
  const mockChain: any = {
    eq: () => mockChain,
    neq: () => mockChain,
    gt: () => mockChain,
    lt: () => mockChain,
    gte: () => mockChain,
    lte: () => mockChain,
    like: () => mockChain,
    ilike: () => mockChain,
    is: () => mockChain,
    in: () => mockChain,
    contains: () => mockChain,
    containedBy: () => mockChain,
    rangeGt: () => mockChain,
    rangeGte: () => mockChain,
    rangeLt: () => mockChain,
    rangeLte: () => mockChain,
    rangeAdjacent: () => mockChain,
    overlaps: () => mockChain,
    match: () => mockChain,
    not: () => mockChain,
    or: () => mockChain,
    filter: () => mockChain,
    order: () => mockChain,
    limit: () => mockChain,
    range: () => mockChain,
    abortSignal: () => mockChain,
    single: () => mockResult(),
    maybeSingle: () => mockResult(),
    select: () => mockChain,
    insert: () => mockResult(),
    upsert: () => mockResult(),
    update: () => mockChain,
    delete: () => mockChain,
    then: (onfulfilled: any) => mockResult().then(onfulfilled),
    catch: (onrejected: any) => mockResult().catch(onrejected)
  };

  return {
    from: () => mockChain,
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: errorMsg } }),
      signOut: () => Promise.resolve({ error: null }),
    }
  };
};

if (!supabaseUrl || !supabaseKey) {
  console.warn("WARNING: Supabase URL or Key is missing. Database features will not work.");
  supabase = createMockSupabase();
} else if (!supabaseKey.startsWith('eyJ')) {
  console.error("CRITICAL ERROR: Your SUPABASE_KEY does not look like a valid public/secret key (it should be a very long JWT string starting with 'eyJ').");
  console.error("Please check your Supabase Dashboard -> Settings -> API for the 'anon' public key.");
  supabase = createMockSupabase("Invalid SUPABASE_KEY format");
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
    supabase = createMockSupabase(err instanceof Error ? err.message : String(err));
  }
}

const defaultData = {
  hero: {
    name: "Abdul Kaium",
    title: "Computer Science Student",
    typingTexts: ["Python Enthusiast", "Cyber Security Learner", "Diploma Student"],
    description: "Currently studying Computer Science & Technology at Daffodil Polytechnic Institute. Passionate about automation, cyber security, and building efficient digital tools.",
    logo: "",
    heroImage: "",
    favicon: ""
  },
  about: {
    bio1: "I am a first-semester student at Daffodil Polytechnic Institute, specializing in the CST Department. My academic journey is focused on mastering the fundamentals of Computer Science and Technology.",
    bio2: "Beyond my studies, I am an active member of the DPI Cyber Security Club. I am currently dedicated to learning cyber security fundamentals to build a strong foundation in digital safety and ethical hacking.",
    location: "Bonomala, Tongi, Gazipur",
    experience: "Diploma in CST (2026-Present)",
    image: "https://picsum.photos/seed/kaium/800/800"
  },
  skills: [
    { id: "1", title: "Technical Skills", icon: "Code2", skills: ["Python (Learning)", "Data Entry", "File Management", "Internet Research"] },
    { id: "2", title: "Productivity", icon: "Globe", skills: ["MS Word", "MS Excel", "MS PowerPoint", "Email & Google Apps"] },
    { id: "3", title: "Soft Skills", icon: "Palette", skills: ["Time Management", "Teamwork", "Cyber Security Basics"] }
  ],
  projects: [
    { id: "1", title: "PDF Merger (Python CLI)", desc: "A command-line tool built with Python to merge multiple PDF documents into a single file efficiently.", tags: ["Python", "CLI", "Automation"], img: "https://picsum.photos/seed/pdf/800/600", githubUrl: "https://github.com/kaium10-lab" },
    { id: "2", title: "Automated Messaging Script", desc: "A Python-based script designed to automate repetitive messaging tasks for learning and testing purposes.", tags: ["Python", "Scripting", "Automation"], img: "https://picsum.photos/seed/script/800/600", githubUrl: "https://github.com/kaium10-lab" }
  ],
  socials: [
    { id: "1", name: "GitHub", url: "https://github.com/kaium10-lab", icon: "Github" },
    { id: "2", name: "LinkedIn", url: "https://www.linkedin.com/in/a-kaium10/", icon: "Linkedin" },
    { id: "3", name: "Facebook", url: "https://facebook.com", icon: "Globe" }
  ],
  contact: {
    email: "a.kaium2008@gmail.com",
    linkedin: "https://www.linkedin.com/in/a-kaium10/",
    github: "https://github.com/kaium10-lab",
    address: "Bonomala, Tongi, Gazipur",
    addressLink: "https://maps.google.com"
  },
  security: {
    stayLoggedIn: true
  }
};

// Seed initial data if empty
// Note: In Supabase, we'll check if data exists on the first request or provide a way to seed it.
// For this app, we'll check in the /api/data route.

function handleSupabaseError(error: any, context: string) {
  if (!error) return;
  
  let message = `Supabase error [${context}]: ${error.message || JSON.stringify(error)}`;
  let hint = "";

  if (error.message?.includes('getaddrinfo ENOTFOUND')) {
    hint = "HINT: The Supabase project URL could not be resolved. Please check if your project is PAUSED or if the URL is correct.";
  } else if (error.message?.includes('fetch failed')) {
    hint = "HINT: Network request to Supabase failed. Check your internet connection or Supabase project status.";
  } else if (error.code === '42P01') {
    hint = "HINT: Table not found. Did you run the SQL setup script in the Supabase SQL Editor?";
  } else if (error.code === 'PGRST301') {
    hint = "HINT: JWT expired or invalid. Check your SUPABASE_KEY.";
  }

  console.error(message);
  if (hint) console.error(hint);
  
  return { message, hint, originalError: error };
}

const app = express();

// Trust proxy for correct IP detection behind Cloud Run/Nginx
app.set('trust proxy', true);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Configure Multer for file uploads
const uploadDir = process.env.VERCEL ? "/tmp" : path.join(__dirname, "uploads");
if (!process.env.VERCEL && !fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir);
  } catch (err) {
    console.warn("Failed to create uploadDir:", err);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Authentication Middleware
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: Token missing" });
    }
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          console.warn("JWT Expired:", err.message);
        } else {
          console.error("JWT Verification Error:", err.message);
        }
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
      }
      (req as any).user = decoded;
      next();
    });
  } catch (err) {
    console.error("Auth Middleware Exception:", err);
    return res.status(500).json({ success: false, message: "Internal server error during authentication" });
  }
};

// Serve uploads folder
app.use("/uploads", express.static(uploadDir));

// Removed top-level async Supabase check for Vercel stability
const checkSupabase = async () => {
    console.log("Supabase check will be attempted on first request.");
};

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    vercel: !!process.env.VERCEL,
    supabase: !!(supabaseUrl && supabaseKey),
    timestamp: new Date().toISOString() 
  });
});

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API is working", timestamp: new Date().toISOString() });
});

app.get("/api/data", async (req, res) => {
    try {
      // Try Supabase first
      const { data: row, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'portfolio_data')
        .maybeSingle();

      if (!error && row && row.value) {
        try {
          const data = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
          if (!data.security) data.security = defaultData.security;
          data._storage = 'supabase';
          return res.json(data);
        } catch (parseErr) {
          console.error("JSON parse error for Supabase data:", parseErr);
        }
      }

      if (error) {
        handleSupabaseError(error, "fetchData");
      }

      // Fallback to local SQLite
      if (localDb) {
        console.log("Falling back to local SQLite for portfolio data...");
        const localRow = localDb.prepare("SELECT value FROM settings WHERE key = ?").get('portfolio_data') as any;
        if (localRow && localRow.value) {
          try {
            const data = JSON.parse(localRow.value);
            if (!data.security) data.security = defaultData.security;
            data._storage = 'local';
            return res.json(data);
          } catch (parseErr) {
            console.error("JSON parse error for local SQLite data:", parseErr);
          }
        }
      }

      // If both fail, return default data
      const finalDefault = { ...defaultData, _storage: 'default' };
      res.json(finalDefault);
    } catch (err) {
      console.error("Unexpected error in /api/data:", err);
      res.json(defaultData);
    }
  });

  app.post("/api/data", authenticate, async (req, res) => {
    const newData = req.body;
    const payload = { 
      key: 'portfolio_data', 
      value: JSON.stringify(newData) 
    };

    // Always save to local SQLite first as a reliable cache
    if (localDb) {
      try {
        localDb.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(payload.key, payload.value);
        console.log("Portfolio data cached to local SQLite.");
      } catch (localErr) {
        console.error("Failed to save to local SQLite:", localErr);
      }
    }

    console.log("Attempting to save portfolio data to Supabase...");
    try {
      const { error } = await supabase
        .from('settings')
        .upsert(payload, { onConflict: 'key' });
      
      if (error) {
        handleSupabaseError(error, "saveData");
        
        let customMessage = error.message;
        if (error.code === '42P01') {
          customMessage = "The 'settings' table does not exist in Supabase. Data was saved LOCALLY only.";
        } else if (error.code === '42501') {
          customMessage = "Supabase RLS is blocking the save. Data was saved LOCALLY only.";
        } else {
          customMessage = `Supabase error: ${error.message}. Data was saved LOCALLY only.`;
        }

        // Return error if no local persistence
        if (!localDb) {
           return res.status(500).json({ 
             success: false, 
             message: `Failed to save to Supabase and no local database available. Error: ${customMessage}`,
             error: error
           });
        }

        // Return success with warning if only local save worked
        return res.json({ 
          success: true, 
          warning: customMessage,
          localOnly: true
        });
      }
      
      console.log("Portfolio data saved successfully to Supabase.");
      res.json({ success: true });
    } catch (err: any) {
      console.error("Server Save Exception:", err);
      // Still return success if local save worked
      res.json({ success: true, localOnly: true, warning: "Saved locally due to server error." });
    }
  });

  // Brute-force protection tracking
  const loginAttempts = new Map<string, { count: number, blockedUntil: number }>();
  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION = 60 * 1000; // 1 minute

  app.post("/api/login", async (req, res) => {
    const { email: rawEmail, password: rawPassword } = req.body;
    const email = rawEmail?.trim();
    const password = rawPassword?.trim();
    
    console.log(`Login attempt for: ${email}`);
    
    // req.ip is more reliable when 'trust proxy' is enabled
    const ipStr = req.ip || 'unknown';

    if (!email || !password) {
      console.log("Login failed: Missing email or password");
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Check if blocked
    const attempt = loginAttempts.get(ipStr);
    if (attempt && attempt.blockedUntil > Date.now()) {
      const remainingSeconds = Math.ceil((attempt.blockedUntil - Date.now()) / 1000);
      console.log(`Login blocked for IP ${ipStr} for ${remainingSeconds}s`);
      return res.status(429).json({ 
        success: false, 
        message: `Too many failed attempts. Please try again after ${remainingSeconds} seconds.` 
      });
    }
    
    try {
      let loginSuccess = false;
      let userEmail = "";

      // Master Login Override (Temporary for recovery)
      if ((email === "admin@kaium.com" || email === "ab.kaium2008@gmail.com") && password === "kaium123") {
         console.log("Master login override used for:", email);
         loginSuccess = true;
         userEmail = email;
      }

      if (!loginSuccess) {
        // Try Supabase first
        console.log("Checking Supabase for login...");
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .maybeSingle();

        if (user && !error) {
          console.log("Supabase login success for:", email);
          loginSuccess = true;
          userEmail = user.email;
        } else {
          if (error) {
            handleSupabaseError(error, "login");
          }
          
          // Fallback to local SQLite if Supabase failed or user not found
          if (localDb) {
            console.log("Checking local SQLite for login...");
            const localUser = localDb.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
            if (localUser) {
              console.log("Local SQLite login success for:", email);
              loginSuccess = true;
              userEmail = localUser.email;
            }
          }
        }
      }

      if (loginSuccess) {
        console.log("Login successful for:", userEmail);
        // Reset attempts on success
        loginAttempts.delete(ipStr);
        const token = jwt.sign({ email: userEmail }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ success: true, token });
      } else {
        console.log("Login failed: Invalid credentials for:", email);
        // Increment failed attempts
        const currentAttempt = loginAttempts.get(ipStr) || { count: 0, blockedUntil: 0 };
        currentAttempt.count += 1;
        
        if (currentAttempt.count >= MAX_ATTEMPTS) {
          currentAttempt.blockedUntil = Date.now() + BLOCK_DURATION;
          loginAttempts.set(ipStr, currentAttempt);
          console.log(`IP ${ipStr} blocked due to too many failed attempts`);
          return res.status(429).json({ 
            success: false, 
            message: `Too many failed attempts. You are blocked for 1 minute.` 
          });
        }
        
        loginAttempts.set(ipStr, currentAttempt);
        const remaining = MAX_ATTEMPTS - currentAttempt.count;
        return res.status(401).json({ 
          success: false, 
          message: `Invalid credentials. ${remaining} attempts remaining.` 
        });
      }
    } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ success: false, message: "Internal server error during login" });
    }
  });

  app.post("/api/update-credentials", authenticate, async (req, res) => {
    const { email, password } = req.body;
    const currentEmail = (req as any).user.email;
    
    try {
      // Try to update by current email first
      const { data, error: updateError } = await supabase
        .from('users')
        .update({ email, password })
        .eq('email', currentEmail)
        .select();
      
      // If update failed or no rows affected, and it was the fallback admin, try to insert
      if (updateError || !data || data.length === 0) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({ email, password });
        
        if (insertError) {
          handleSupabaseError(insertError, "updateCredentials");
          let msg = insertError.message;
          if (insertError.code === '42P01') msg = "Table 'users' not found. Please run the SQL script.";
          if (insertError.code === '23505') msg = "Email already exists.";
          return res.status(500).json({ success: false, message: msg });
        }
      }
      
      res.json({ success: true });
    } catch (err: any) {
      console.error("Server Update Credentials Error:", err);
      res.status(500).json({ success: false, message: err.message || "Failed to update credentials" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;
    const createdAt = new Date().toISOString();

    // Always save to local SQLite first
    if (localDb) {
      try {
        localDb.prepare("INSERT INTO messages (name, email, message, created_at) VALUES (?, ?, ?, ?)").run(name, email, message, createdAt);
        console.log("Contact message cached to local SQLite.");
      } catch (localErr) {
        console.error("Failed to save contact message to local SQLite:", localErr);
      }
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{ name, email, message, created_at: createdAt }]);
      
      if (error) {
        handleSupabaseError(error, "contactForm");
        // We still return success if local save worked
        return res.json({ success: true, localOnly: true, warning: "Message saved locally. Supabase connection failed." });
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error("Server Contact Error:", err);
      res.json({ success: true, localOnly: true, warning: "Message saved locally due to server error." });
    }
  });

  app.get("/api/messages", authenticate, async (req, res) => {
    try {
      let allMessages: any[] = [];
      
      // Try Supabase
      const { data: supabaseMessages, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && supabaseMessages) {
        allMessages = [...supabaseMessages];
      } else if (error) {
        handleSupabaseError(error, "getMessages");
      }

      // Merge with local SQLite messages
      if (localDb) {
        try {
          const localMessages = localDb.prepare("SELECT * FROM messages ORDER BY created_at DESC").all() as any[];
          
          // Simple merge: add local messages that aren't in Supabase
          const combined = [...allMessages, ...localMessages];
          
          // Sort by date descending
          combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          // Remove duplicates (very basic check)
          const unique = combined.filter((msg, index, self) =>
            index === self.findIndex((m) => (
              m.email === msg.email && m.message === msg.message && m.created_at === msg.created_at
            ))
          );

          return res.json(unique);
        } catch (localErr) {
          console.error("Failed to fetch local messages:", localErr);
          return res.json(allMessages);
        }
      } else {
        return res.json(allMessages);
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete("/api/messages/:id", authenticate, async (req, res) => {
    const { id } = req.params;
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);
      
      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/upload", authenticate, upload.single("image"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Try to upload to Supabase Storage for persistence if configured
    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('mock')) {
      try {
        const fileContent = fs.readFileSync(req.file.path);
        const fileExt = path.extname(req.file.originalname);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}${fileExt}`;
        const bucketName = 'uploads';

        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, fileContent, {
            contentType: req.file.mimetype,
            upsert: false
          });

        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);
          
          // Clean up the local temporary file
          try { fs.unlinkSync(req.file.path); } catch (e) {}
          
          console.log("File uploaded to Supabase Storage:", publicUrl);
          return res.json({ success: true, url: publicUrl });
        } else {
          console.warn("Supabase Storage upload failed (falling back to local):", error?.message);
          if (error?.message?.includes('bucket not found')) {
            console.warn("HINT: Please create a public bucket named 'uploads' in your Supabase project.");
          }
        }
      } catch (err) {
        console.error("Supabase Storage exception:", err);
      }
    }

    // Fallback if Supabase is not available or failed
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
  });

// Catch-all for undefined API routes to prevent returning HTML
app.all("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: `API route ${req.method} ${req.url} not found` });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ 
    success: false, 
    message: "Internal Server Error", 
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

async function startServer() {
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error("Failed to load Vite server:", err);
    }
  } else if (!process.env.VERCEL) {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
