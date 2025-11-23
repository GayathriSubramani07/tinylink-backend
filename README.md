# ⚙️ TinyLink Backend API

**TinyLink Backend** is a RESTful API built with Node.js and Express.js for managing short links.  
It connects to a PostgreSQL database hosted on **Neon** and is deployed on **Render**.

---

## 🌐 Live API
👉 [https://tinylink-backend-tyfm.onrender.com](https://tinylink-backend-tyfm.onrender.com)

---

## 🗃️ Database
- Hosted on **Neon (PostgreSQL Cloud)**
- Automatically creates `links` table if not present
- Table fields:
  - `id`
  - `code`
  - `url`
  - `clicks`
  - `lastclicked`
  - `createdat`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| `GET` | `/api/links` | Fetch all short links |
| `POST` | `/api/links` | Create a new short link |
| `DELETE` | `/api/links/:code` | Delete a short link |
| `GET` | `/:code` | Redirect to the original long URL |

---

## 🛠️ Tech Stack
- **Node.js**
- **Express.js**
- **PostgreSQL (Neon)**
- **Render (Deployment)**
- **CORS Enabled**

---

## ⚙️ Environment Variables
| Key | Description |
|-----|--------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Port for server (default: 3000) |

Example `.env`:
## 🧩 Related Repository
Frontend Code:  
👉 [https://github.com/GayathriSubramani07/tinylink-frontend](https://github.com/GayathriSubramani07/tinylink-frontend)
