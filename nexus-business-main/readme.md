<h1 align="center">Business Nexus</h1>

<p align="center">
  <strong>A high-fidelity professional ecosystem engineered to bridge the gap between visionary entrepreneurs and strategic investors.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/Sumit444-commits/nexus-business?style=flat-square" alt="License">
  <img src="https://img.shields.io/github/stars/Sumit444-commits/nexus-business?style=flat-square" alt="Stars">
  <img src="https://img.shields.io/github/languages/top/Sumit444-commits/nexus-business?style=flat-square" alt="Top Language">
  <img src="https://img.shields.io/github/last-commit/Sumit444-commits/nexus-business?style=flat-square" alt="Last Commit">
</p>

<p align="center">
  <a href="https://businessnexus.vercel.app/"><strong>View Live Demo »</strong></a>
</p>


---

## 🚀 Key Features

*   **Dual-Persona Ecosystem:** Tailored experience for both **Entrepreneurs** (pitching, seeking capital) and **Investors** (portfolio management, discovery).
*   **Real-time Communication:** Integrated chat system powered by **Pusher**, enabling instantaneous negotiation and networking between stakeholders.
*   **Collaboration Pipeline:** Robust request management system to initiate, track, and manage partnership proposals and investment interests.
*   **Secure Document Vault:** Centralized document management system for sharing pitch decks, financial statements, and legal agreements.
*   **Deal Flow Management:** Comprehensive tracking of active business deals, from initial contact to finalized investment.
*   **Smart Notifications:** Real-time alert system for messages, collaboration updates, and document interactions.

---

## 🛠 Technology Stack

### Frontend (Nexus)
| Technology | Description | Version |
| :--- | :--- | :--- |
| **React** | UI Library with TypeScript | ^18.3.1 |
| **Vite** | Next-generation Frontend Tooling | ^5.4.2 |
| **Tailwind CSS** | Utility-first CSS Framework | ^3.4.1 |
| **React Router** | Client-side Routing | ^6.22.1 |
| **Pusher JS** | Real-time WebSocket Logic | ^5.3.3 |
| **Lucide React** | High-quality UI Icons | ^0.344.0 |

### Backend (business-nexus-backend)
| Technology | Description | Version |
| :--- | :--- | :--- |
| **Node.js** | Runtime Environment | 18+ |
| **Express** | Web Framework | ^5.2.1 |
| **MongoDB** | NoSQL Database (via Mongoose) | ^9.3.3 |
| **JSON Web Token** | Stateless Authentication | ^9.0.3 |
| **Multer** | File Upload Middleware | ^2.1.1 |

---

## 📂 Directory Structure

```text
.
├── Nexus/                          # Frontend Application (Vite + React)
│   ├── src/
│   │   ├── components/             # Reusable UI, Layout, and Feature components
│   │   ├── context/                # AuthContext & Global State
│   │   ├── data/                   # Mock data and static assets
│   │   ├── pages/                  # Routed views (Dashboard, Profiles, Chat)
│   │   ├── types/                  # TypeScript interfaces/definitions
│   │   └── App.tsx                 # Core Routing logic
│   ├── tailwind.config.js          # Styling configuration
│   └── tsconfig.json               # TypeScript configuration
└── business-nexus-backend/         # Backend API (Node.js + Express)
    ├── controllers/                # Business logic for Auth, Deals, Messages
    ├── middlewares/                # Auth guards and validation
    ├── models/                     # Mongoose Schemas (User, Deal, Notification)
    ├── routes/                     # API Endpoint definitions
    └── server.js                   # Server entry point
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas)
- Pusher Account (for real-time features)

### Environment Variables
Create a `.env` file in the `business-nexus-backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
```

Create a `.env` file in the `Nexus` directory:
```env
VITE_API_URL=http://localhost:5000
VITE_PUSHER_KEY=your_key
VITE_PUSHER_CLUSTER=your_cluster
```

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Sumit444-commits/nexus-business.git
   cd nexus-business
   ```

2. **Backend Setup**
   ```bash
   cd business-nexus-backend
   npm install
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../Nexus
   npm install
   npm run dev
   ```

---

## 👤 Author

**Sumit444-commits**
*   **GitHub:** [@Sumit444-commits](https://github.com/Sumit444-commits)
*   **LinkedIn:** [Sumit Sharma](https://linkedin.com/in/sumit-sharma-a0b2c7)
*   **Portfolio:** [www.sumitsharma.codes/](https://www.sumitsharma.codes/)

---

Designed with ❤️ [Autome](https://autome.vercel.app)