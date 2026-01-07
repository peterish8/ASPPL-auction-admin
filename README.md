<div align="center">

# 🏢 ASPPL Auction Admin

### Trade & Auction Control Panel

---

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-Private-red?style=flat-square)
![Maintained](https://img.shields.io/badge/Maintained-Yes-success?style=flat-square)

**Amazing Spice Park Private Limited** • Complete Trade Management System

</div>

---

## ✨ Overview

**ASPPL Auction Admin** is a powerful, modern admin dashboard for managing weekly trade auctions. Built with cutting-edge technologies, it provides complete control over trade cycles, submissions, and system configurations.

<div align="center">

🎯 **Full CRUD Operations** • 📱 **Responsive Design** • 🔒 **Secure Auth** • ⚡ **Real-time Updates**

</div>

---

## 🚀 Features

<table>
<tr>
<td width="50%">

### 📊 **Dashboard**
- Real-time statistics overview
- Active trade status display
- Recent submissions feed
- Quick navigation cards

### 📋 **Trade Management**
- Create & manage trades
- Alphanumeric trade numbers (T001, 2024-W1)
- Active/Inactive status toggle
- Automatic single active trade enforcement

### 📍 **Pooling Schedule**
- Location management with dates
- Inline editing capabilities
- Add/Edit/Delete operations
- Trade assignment

</td>
<td width="50%">

### 📝 **Dropdown Manager**
- Category-based organization (Details, Type, Depot)
- Full CRUD operations
- Drag & reorder functionality
- Tab-based interface

### 📦 **Submissions Viewer**
- Complete submissions table
- Advanced filtering (Trade, Depot, Type)
- Search functionality
- Export: CSV, JSON, Clipboard

### 🔄 **Weekly Reset**
- Close current trade
- Create next trade
- One-click full reset
- Confirmation dialogs

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16, React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Icons** | Lucide Icons |

---

## 📁 Project Structure

```
📦 auction-website-admin
├── 📂 src
│   ├── 📂 app
│   │   ├── 📂 dashboard
│   │   │   ├── 📄 page.tsx         # Dashboard overview
│   │   │   ├── 📂 trades           # Trade management
│   │   │   ├── 📂 pooling          # Pooling schedule
│   │   │   ├── 📂 dropdowns        # Dropdown manager
│   │   │   ├── 📂 submissions      # Submissions viewer
│   │   │   └── 📂 reset            # Weekly reset
│   │   └── 📂 login                # Authentication
│   ├── 📂 components
│   │   ├── 📂 ui                   # shadcn/ui components
│   │   ├── 📂 trades               # Trade components
│   │   ├── 📂 pooling              # Pooling components
│   │   ├── 📂 dropdowns            # Dropdown components
│   │   ├── 📂 submissions          # Submission components
│   │   └── 📂 reset                # Reset components
│   └── 📂 lib
│       ├── 📂 supabase             # Database clients
│       ├── 📄 types.ts             # TypeScript interfaces
│       └── 📄 utils.ts             # Utility functions
└── 📄 package.json
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/peterish8/ASPPL-auction-admin.git

# Navigate to project
cd ASPPL-auction-admin

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server (port 3007)
pnpm dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🗄️ Database Schema

```sql
-- Trades table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_number TEXT NOT NULL,
  trade_date TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pooling Schedule
CREATE TABLE pooling_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id UUID REFERENCES trades(id),
  location TEXT NOT NULL,
  pooling_date TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Dropdowns
CREATE TABLE dropdowns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_number TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  device_fingerprint TEXT,
  name TEXT NOT NULL,
  details TEXT NOT NULL,
  weight INTEGER NOT NULL,
  type TEXT NOT NULL,
  depot TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🔐 Security

- ✅ **Supabase Auth** - Secure email/password authentication
- ✅ **Row Level Security (RLS)** - Database-level access control
- ✅ **Protected Routes** - Middleware-based route protection
- ✅ **Environment Variables** - Secure credential management

---

## 👨‍💻 Development

```bash
# Development server (port 3007)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

---

## 📄 License

This project is proprietary software for **Amazing Spice Park Private Limited**.

---

<div align="center">

**Built with ❤️ for ASPPL**

![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-black?style=for-the-badge&logo=next.js)

</div>
