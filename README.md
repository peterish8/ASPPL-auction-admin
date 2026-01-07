<div align="center">

<!-- Animated Header -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=180&section=header&text=ASPPL%20Auction%20Admin&fontSize=42&fontColor=fff&animation=twinkling&fontAlignY=32&desc=Trade%20%26%20Auction%20Control%20Panel&descAlignY=52&descSize=18"/>

<!-- Animated Badges -->
<p>
  <img src="https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js&logoColor=white&labelColor=000000" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black&labelColor=20232A" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=3178C6" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white&labelColor=1C1C1C" alt="Supabase"/>
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white&labelColor=0F172A" alt="Tailwind"/>
</p>

<!-- Status Badges -->
<p>
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=flat-square" alt="Status"/>
  <img src="https://img.shields.io/badge/License-Private-red?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/Maintained-Yes-success?style=flat-square" alt="Maintained"/>
</p>

<br/>

<!-- Animated Typing -->
<a href="#">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=3000&pause=1000&color=6366F1&center=true&vCenter=true&multiline=true&repeat=true&width=600&height=80&lines=🏢+Amazing+Spice+Park+Private+Limited;📊+Complete+Trade+Management+System" alt="Typing SVG" />
</a>

</div>

---

## ✨ Overview

**ASPPL Auction Admin** is a powerful, modern admin dashboard for managing weekly trade auctions. Built with cutting-edge technologies, it provides complete control over trade cycles, submissions, and system configurations.

<div align="center">
  <img src="https://img.shields.io/badge/🎯_Full_CRUD_Operations-blue?style=for-the-badge" alt="CRUD"/>
  <img src="https://img.shields.io/badge/📱_Responsive_Design-purple?style=for-the-badge" alt="Responsive"/>
  <img src="https://img.shields.io/badge/🔒_Secure_Auth-green?style=for-the-badge" alt="Auth"/>
  <img src="https://img.shields.io/badge/⚡_Real--time_Updates-orange?style=for-the-badge" alt="Real-time"/>
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

<div align="center">

| Category | Technologies |
|----------|-------------|
| **Framework** | ![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black) |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) |
| **Styling** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=flat-square&logo=shadcnui&logoColor=white) |
| **Database** | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) |
| **Auth** | ![Supabase Auth](https://img.shields.io/badge/Supabase_Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=white) |
| **Icons** | ![Lucide](https://img.shields.io/badge/Lucide_Icons-F56565?style=flat-square) |

</div>

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

# Run development server
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_number TEXT NOT NULL,
  trade_date TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pooling Schedule
CREATE TABLE pooling_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trades(id),
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Dropdowns
CREATE TABLE dropdowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trades(id),
  trade_number TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  details TEXT,
  weight NUMERIC,
  type TEXT,
  depot TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 📸 Screenshots

<div align="center">

| Dashboard | Trades | Submissions |
|:---------:|:------:|:-----------:|
| 📊 Overview with stats | 📋 Manage trades | 📦 View & export |

| Dropdowns | Pooling | Weekly Reset |
|:---------:|:-------:|:------------:|
| 🏷️ Manage options | 📍 Schedule locations | 🔄 Reset cycle |

</div>

---

## 🔐 Security

- **Supabase Auth** - Secure email/password authentication
- **Row Level Security (RLS)** - Database-level access control
- **Protected Routes** - Middleware-based route protection
- **Environment Variables** - Secure credential management

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

<!-- Footer Wave -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer"/>

<p>
  <strong>Built with ❤️ for ASPPL</strong>
</p>

<p>
  <img src="https://img.shields.io/badge/Made%20with-Next.js-black?style=for-the-badge&logo=next.js" alt="Made with Next.js"/>
</p>

</div>
