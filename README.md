# Abdul Kaium — Portfolio Website

A modern, full-stack personal portfolio website built with React, Express, and Supabase. Features a dynamic admin panel for real-time content management, contact form with message inbox, and a sleek dark-themed design with smooth animations.

## ✨ Features

- **Dynamic Portfolio** — Hero, About, Skills, Projects, Contact sections with smooth scroll animations
- **Admin Panel** — Secured login with JWT auth, brute-force protection, and full content management
- **Supabase Integration** — Cloud database with automatic local SQLite fallback
- **Contact Form** — Visitors can send messages, viewable from the admin inbox
- **Image Uploads** — Upload profile photos, logos, and project images directly from the admin panel
- **Responsive Design** — Fully optimized for desktop, tablet, and mobile devices
- **Typing Animation** — Customizable rotating text animation on the hero section

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Tailwind CSS, Motion (Framer Motion) |
| Backend | Express.js, Node.js |
| Database | Supabase (PostgreSQL) + SQLite fallback |
| Auth | JWT (JSON Web Tokens) |
| Icons | Lucide React |
| Build Tool | Vite |
| Deployment | Vercel-ready |

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase account (optional — works with local SQLite fallback)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kaium10-lab/kaium.git
   cd kaium
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (see `.env.example`):
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_key
   JWT_SECRET=your_jwt_secret
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Setup (Supabase)

For a quick setup, follow these steps:

1. Open the [setup.sql](file:///media/abdulkaium/New%20Volume2/portfolio/setup.sql) file.
2. Copy its entire content.
3. Paste it into the **SQL Editor** in your Supabase dashboard and click **Run**.

This script will create all necessary tables (`settings`, `users`, `messages`), set up Row Level Security (RLS) policies, and seed your initial portfolio data.

### Manual Table Structure (Reference)

If you prefer to create tables manually, use these definitions:

```sql
-- Settings table for portfolio content
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB
);

-- Admin users table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- Messages table for contact form
CREATE TABLE IF NOT EXISTS messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT,
  email TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 📁 Project Structure

```
├── server.ts          # Express backend with API routes
├── src/
│   ├── App.tsx        # Main application component
│   ├── main.tsx       # Entry point
│   ├── index.css      # Global styles
│   ├── types.ts       # TypeScript interfaces
│   └── components/    # React components
│       ├── AdminPanel.tsx
│       ├── Hero.tsx
│       ├── About.tsx
│       ├── Skills.tsx
│       ├── Projects.tsx
│       └── Contact.tsx
├── .env.example       # Environment variables template
├── vite.config.ts     # Vite configuration
├── vercel.json        # Vercel deployment config
└── package.json
```

## 🔐 Admin Access

Navigate to the admin panel via the shield icon and login with your configured credentials.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ by [Abdul Kaium](https://github.com/kaium10-lab)**
