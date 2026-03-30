<div align="center">

# 💸 Expense Tracker | Modern Financial Management

<p align="center">
  <img src="https://img.shields.io/badge/Stack-MERN-0d9488?style=for-the-badge&logo=mongodb&logoColor=white" alt="MERN Stack">
  <img src="https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="ReactJS">
  <img src="https://img.shields.io/badge/UI-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License">
</p>

A state-of-the-art **MERN Stack Expense Tracking Application** designed with a premium, fully-responsive **Glassmorphism UI**. This platform empowers users to effortlessly manage personal finances, track real-time budgets, analyze visual spending patterns, and fully customize their profile with precision image cropping. 

</div>

---

## 📸 1. Stunning Visual Architecture & UI/UX

The application is built prioritizing an elite-level User Experience, taking heavy inspiration from modern Fintech Dashboards.

* **🎨 Advanced Glassmorphism UI:** Implemented using layered CSS backdrop-filters, custom `var(--bg)` constants, and transparent radiant borders to create deep 'frosted glass' layers.
* **🌗 Adaptive Dark & Light Modes:** 100% responsive global theme variables. Text, dropdowns, input rings, and shadows dynamically invert natively between modes without requiring page reloads.
* **📱 Bullet-Proof Responsiveness:** Mobile-first Tailwind layouts guarantee the UI performs and looks identical on smartphones, tablets, and ultra-wide desktop monitors.
* **💫 Fluid Micro-Interactions:** Custom scale-in transition animations across tooltips, buttons (`active:scale-95`), and modal popups.

---

## 🚀 2. Core Application Capabilities

### 📊 **Intelligent Dashboard & Analytics**
* **Real-Time Calculation Overview:** Instantly processes and displays *Total Balance*, *Monthly Income*, *Monthly Expenditures*, and automated *Saving Rates* computations.
* **Interactive Chart Engine:** Integrates responsive visual data parsing using isolated canvas logic. Includes dynamic **Doughnut Charts** for category breakdown and **Semicircle Gauges** marking income/spent percentages.
* **Data Filters:** Ability to dynamically switch analytical bounds between *Daily, Weekly, Monthly, or Yearly* timeframes natively updating the DOM metrics immediately.

### 💳 **Smart Universal Transaction Engine**
* **Custom Built Modals:** Universal popups allow users to swiftly Record, Edit, and Audit transactions.
* **Income/Expense Separation:** Logically isolated forms dynamically recolor depending on the category selected (Teal for Income, Orange for Expenses).
* **Auto-Categorizing Feeds:** The Recent Transactions feed automatically assigns correct visual initials and timeline sorting.

### 🔐 **Enterprise-Grade Authentication Framework**
* **JSON Web Tokens (JWT):** All internal APIs are fortified to intercept manipulation. It issues cryptographically secure, persistent, stateless tokens.
* **Strong Password Policies:** Hard-coded Regex implementation blocks creation and modification of passwords lacking upper/lowercase sequences, integers, and special trailing characters.
* **Seamless Login Experience:** Automatic routing interception (`useAuth()`), protecting dashboard payloads from unauthenticated users.

### 👤 **Profile & Identity Adjustments**
* **Immersive Avatar Cropper:** Integrates `react-easy-crop` inside pure CSS 2D canvas containers; enabling users to upload, zoom via pinch/scroll, tightly crop avatars, scale them down, and host high-res profiles directly to the Database.

---

## 🛠️ 3. Full Technology Stack Breakdown

| Technology Layer | Core Tools & Libraries | Dedicated Focus / Reasoning |
| :--- | :--- | :--- |
| **Frontend Framework** | React.js (Vite), React Hooks | Maximum speed Hot Module Replacement (HMR), Component mapping |
| **Design System** | TailwindCSS, Lucide-React Icons | Utility-first glassmorphism styling, clean modern scalable SVGs |
| **Backend API** | Node.js, Express.js | High-concurrency RESTful routing, fast JSON deserialization |
| **Database** | MongoDB, Mongoose ODM | Strict backend Schema validation, efficient NoSQL queries |
| **Authentication** | Bcrypt.js, Context API, JWT | Extreme hash-salting, safe payload extraction, local global-state |
| **Micro-Utilities** | react-hot-toast, react-router-dom | Non-intrusive popups notifications, dynamic client-side URL history |

---

## 🔌 4. Primary API Route Mappings

A decoupled, strictly RESTful architecture separating Auth controllers from Transaction ledgers.

### 🛡️ **Authentication Routes (`/api/auth`)**
* `POST /register` — Validates email regex, hashes passwords, allocates new User Document.
* `POST /login` — Compares payload hashes, provisions and signs stateless JSON tokens.
* `PUT /profile` — Intercepts base64 encoded picture data, scales avatar binary payloads.
* `PUT /change-password` — Safely verifies old credentials before overwriting hash logic.

### 💸 **Financial Routes (`/api/transactions`)**
* `POST /` — Commits new financial array entries corresponding to the logged-in JWT user.
* `PUT /:id` — Modifies numerical aggregates safely preventing cross-user edits.
* `GET /dashboard/summary` — Parses aggregation pipes mapping `Income/Expenses` globally filtered by specific time arrays.

---

## 💻 5. Deep Developer Local Guide

Re-create the **Expense Tracker** securely on your local environment following these steps.

### ⚙️ Engine Prerequisites
You must have the following running natively:
- **Node.js** (v16.x LTS or higher)
- **MongoDB** (Local instance / Compass OR Atlas Remote Cluster URI string)

### 📥 1. Clone & Entry
```bash
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
```

### 🧠 2. Backend Initialization
Setup runtime dependencies for Express schemas:
```bash
cd backend
npm install
```
Create a `.env` configuration file immediately in `/backend` to map local tokens:
```env
PORT=5000
MONGO_URI=mongodb+srv://<USER>:<PASS>@cluster.mongodb.net/expense_tracker
JWT_SECRET=super_secret_cryptographic_key_insert_here
```
Boot the API Layer:
```bash
node server.js
# Output: Connected to MongoDB & Server active on port 5000
```

### 🖥️ 3. Frontend Initialization
Spawn a secondary terminal and inject React dependencies:
```bash
cd frontend
npm install
```
*(Optional)* Add a `.env` in the UI to dynamically link mapping paths on production builds:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
Run the hot-reloading Vite server:
```bash
npm run dev
```

> 🎉 **Ready Set Track!** Application actively bound to `http://localhost:5173`. Fire up a browser instance to test Authentication scopes and record transactions!

---

<div align="center">
  <i>Developed specifically for intuitive personal financial auditing and dynamic visual metrics.</i>
</div>
