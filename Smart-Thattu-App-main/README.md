# 🍽️ Smart Thattu

> **Smart Thattu** is a smart meal and family food-management application designed to help users organize family members, manage meals, analyze food information, and communicate through an integrated chat system.

🌐 **Live Demo:** [Smart Thattu](https://smart-thattu-app.vercel.app/)

📦 **Repository:** [GitHub – Smart-Thattu-App](https://github.com/SelvaKailashS/Smart-Thattu-App)

---

## ✨ Overview

**Smart Thattu** is a modern web application built to make everyday meal management smarter and more organized.

The application provides a centralized platform where users can:

* 👨‍👩‍👧‍👦 Manage family members
* 🍱 Manage and track meals
* 📊 Analyze meal-related information
* 💬 Communicate using an integrated chat system
* ⚙️ Manage personalized application settings
* 🔐 Securely synchronize data across devices using Supabase
* 💾 Use the application locally without creating an account

The application supports **two operating modes**:

### 🖥️ Local Mode

The default mode stores application data directly in the browser using `localStorage`.

No account or external database is required.

### ☁️ Supabase Mode

Users can optionally connect the application to Supabase to enable authentication and synchronization across devices.

Synced information includes:

* Family members
* Meals and analysis
* Chat messages
* User settings

Supabase Row Level Security (RLS) ensures users can access only their own data.

---

## 🚀 Features

### 👨‍👩‍👧 Family Management

Create and manage family members from a centralized interface.

**Features include:**

* Add family members
* Store member information
* Manage family-related data
* Synchronize family data when Supabase mode is enabled

---

### 🍽️ Meal Management

Smart Thattu provides functionality for managing meals and associated information.

Users can organize their meal-related data and use the application's analysis functionality to gain useful insights.

---

### 📊 Meal Analysis

The application includes data-analysis functionality to help users understand their meal information.

The project uses **Recharts** for data visualization.

This allows information to be presented through interactive graphical components.

---

### 💬 Family Chat

Smart Thattu includes an integrated chat system.

Chat messages can be stored and synchronized when Supabase mode is enabled.

This makes it possible for family members to communicate within the application.

---

### 🔐 Authentication

Supabase authentication is supported through email and password.

OAuth providers can also be enabled through the Supabase dashboard.

Authentication is handled using the standard Supabase session system.

---

### ☁️ Cross-Device Synchronization

When Supabase is configured, application data can be synchronized across multiple devices.

The following data is supported:

| Data                 | Supabase Table   |
| -------------------- | ---------------- |
| Family Members       | `family_members` |
| Meals & Analysis     | `meals`          |
| Chat History         | `chat_messages`  |
| Application Settings | `user_settings`  |

All tables use **Row Level Security (RLS)** to restrict users to their own data.

---

## 🛠️ Tech Stack

### Frontend

* **Next.js 16**
* **React 19**
* **TypeScript**
* **Tailwind CSS**
* **Framer Motion**
* **Lucide React**

### Backend / Database

* **Supabase**
* **PostgreSQL**
* **Drizzle ORM**
* **Node PostgreSQL (`pg`)**

### State Management

* **Zustand**

### Data Visualization

* **Recharts**

### Development Tools

* **ESLint**
* **TypeScript**
* **Drizzle Kit**
* **PostCSS**

The repository's `package.json` confirms the project's Next.js, React, Supabase, Drizzle, Tailwind, Zustand, Framer Motion and Recharts dependencies.

---

## 📁 Project Structure

```text
Smart-Thattu-App/
│
├── public/
│   └── Static assets
│
├── src/
│   ├── app/
│   │   └── Next.js application routes
│   │
│   ├── components/
│   │   └── Reusable UI components
│   │
│   ├── data/
│   │   └── Application data
│   │
│   ├── db/
│   │   └── Database-related functionality
│   │
│   ├── lib/
│   │   └── Utility and service functions
│   │
│   └── types/
│       └── TypeScript type definitions
│
├── supabase/
│   ├── migrations/
│   │   └── Database migrations
│   │
│   └── README.md
│
├── .env.example
├── .gitignore
├── drizzle.config.json
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

The current repository contains separate `app`, `components`, `data`, `db`, `lib`, and `types` areas under `src`, together with Supabase migrations.

---

# ⚙️ Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/SelvaKailashS/Smart-Thattu-App.git
```

Navigate into the project:

```bash
cd Smart-Thattu-App
```

---

## 2. Install Dependencies

Using npm:

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** Supabase configuration is optional if you want to use Smart Thattu in local-only mode.

---

# 🗄️ Supabase Setup

If you want authentication and cloud synchronization:

### Step 1 — Create a Supabase Project

Create a new project in Supabase.

### Step 2 — Run the Database Migration

Open the **SQL Editor** in your Supabase dashboard.

Run:

```text
supabase/migrations/001_init.sql
```

The migration creates the required tables, Row Level Security policies, and the user-settings trigger.

### Step 3 — Get API Credentials

From your Supabase project:

```text
Settings
   ↓
API
   ↓
Project URL
Anon/Public Key
```

Add them to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4 — Restart the Development Server

```bash
npm run dev
```

After configuration, the application provides the authentication functionality.

The repository's Supabase documentation confirms the local-storage mode, Supabase mode, migration setup, environment variables, synchronized tables, and RLS configuration.

---

# ▶️ Running the Application

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 📦 Available Scripts

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `npm run dev`       | Starts the development server |
| `npm run build`     | Creates a production build    |
| `npm run start`     | Starts the production server  |
| `npm run lint`      | Runs ESLint                   |
| `npm run typecheck` | Runs TypeScript type checking |

These scripts are defined in the project's `package.json`.

---

# 🏗️ Production Build

Create a production build:

```bash
npm run build
```

Then start the production server:

```bash
npm run start
```

---

# 🌐 Deployment

Smart Thattu can be deployed using platforms that support Next.js applications.

The repository currently provides a deployed application at:

**Smart Thattu Web App**

https://smart-thattu-app.vercel.app/

Before deploying, make sure the required environment variables are configured in the hosting platform:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

# 🔒 Security

Smart Thattu uses Supabase Row Level Security when cloud synchronization is enabled.

The database policies are designed so authenticated users can access only records associated with their own user ID.

```text
Authenticated User
       │
       ▼
   Supabase Auth
       │
       ▼
   PostgreSQL
       │
       ▼
    RLS Policy
       │
       ▼
 User's Own Data
```

Never commit sensitive credentials, service-role keys, passwords, or private API keys to the repository.

---

# 🔄 Application Architecture

```text
                 ┌──────────────────────┐
                 │      Smart Thattu     │
                 │      Next.js App      │
                 └──────────┬───────────┘
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
      ┌──────────────┐             ┌──────────────┐
      │  Local Mode  │             │ Supabase Mode│
      └──────┬───────┘             └──────┬───────┘
             │                            │
             ▼                            ▼
       Browser Storage              Supabase Auth
          localStorage                    │
                                          ▼
                                    PostgreSQL DB
                                          │
                                          ▼
                                       RLS
```

---

# 📊 Data Model

Smart Thattu currently organizes cloud-synchronized information around four major areas:

```text
User
 │
 ├── Family Members
 │
 ├── Meals
 │    └── Meal Analysis
 │
 ├── Chat Messages
 │
 └── User Settings
```

This structure allows the application to keep family, meal, communication, and personalization data associated with individual users.

---

# 🎯 Project Goals

Smart Thattu aims to provide a simple and modern platform for managing family-oriented meal information.

### Main goals

* Simplify family meal management
* Centralize meal-related information
* Provide useful visual analysis
* Enable family communication
* Support both offline/local and cloud-based workflows
* Maintain secure user-specific cloud data
* Provide a responsive modern user experience

---

# 🔮 Future Improvements

Possible future enhancements include:

* 🤖 AI-powered meal recommendations
* 🥗 Personalized nutrition suggestions
* 📷 Food image recognition
* 📈 Advanced nutrition analytics
* 🔔 Meal reminders
* 📅 Meal planning calendar
* 🛒 Smart grocery-list generation
* 📱 Progressive Web App support
* 🌍 Multi-language support
* 👥 Improved family collaboration
* 📊 Advanced health and nutrition dashboards

---

# 🤝 Contributing

Contributions are welcome!

### 1. Fork the repository

```bash
git clone https://github.com/SelvaKailashS/Smart-Thattu-App.git
```

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

### 3. Make your changes

Implement your feature or fix.

### 4. Test the project

```bash
npm run lint
npm run typecheck
npm run build
```

### 5. Commit your changes

```bash
git add .
git commit -m "Add: your feature"
```

### 6. Push your branch

```bash
git push origin feature/your-feature
```

### 7. Create a Pull Request

Open a Pull Request on GitHub describing your changes.

---

# 📜 License

License information should be added here if a specific open-source license is selected for the project.

---

# 👨‍💻 Author

**SelvaKailashS**

GitHub:
https://github.com/SelvaKailashS

---

# ⭐ Support

If you find **Smart Thattu** useful:

* ⭐ Star the repository
* 🐛 Report bugs
* 💡 Suggest new features
* 🤝 Contribute to the project

---

## ❤️ Smart Thattu

**Making family meal management smarter, simpler, and more connected.**
