# EduMaster Tuition Management Portal — Deployment Guide

This project is pre-configured for deployment on **Vercel** and **Render**.

---

## Architecture Choices

You have two recommended deployment models:

| Model | Frontend | Backend | Best For |
| :--- | :--- | :--- | :--- |
| **Model A (Recommended)** | **Vercel** | **Render** | Best performance, global CDN for frontend, dedicated Node.js process for backend |
| **Model B (Single Service)** | **Render** | **Render** | Simplest setup: 1 single service on Render serves both React frontend and Express API |
| **Model C (Serverless)** | **Vercel** | **Vercel** | Entire full-stack on Vercel using Vercel Serverless Functions (`api/index.js`) |

---

## Model A: Deploy Frontend on Vercel + Backend on Render (Recommended)

### Step 1: Deploy Backend to Render

1. Sign in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository: `dilipyadav756/tuition-management-app`.
4. Fill in the service settings:
   - **Name:** `edumaster-backend` (or your preferred name)
   - **Region:** Closest to your users (e.g., *Singapore*, *Frankfurt*, *Oregon*)
   - **Branch:** `main`
   - **Root Directory:** Leave empty
   - **Runtime:** `Node`
   - **Build Command:** `npm install --include=dev && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
5. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render will automatically bind to this)
   - `JWT_SECRET` = Click **Generate** or provide a 32+ character random string
   - `MONGODB_URI` = *(Copy the exact connection string from Atlas → Connect → Connect your application → Node.js driver)*
   - `CLIENT_URL` = `https://*.vercel.app` (or add your specific Vercel URL later)
6. Click **Deploy Web Service**.
7. Once deployed, copy your Render URL: e.g. `https://edumaster-backend.onrender.com`.

---

### Step 2: Deploy Frontend to Vercel

1. Sign in to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository: `dilipyadav756/tuition-management-app`.
4. Configure the project:
   - **Framework Preset:** `Vite` (automatically detected)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://edumaster-backend.onrender.com` *(Replace with your actual Render URL from Step 1)*
6. Click **Deploy**.
7. In ~60 seconds, your site is live at `https://your-project.vercel.app`!

---

## Model B: Deploy Full-Stack on Render (Single Service)

If you want a single URL that serves both the client UI and the backend API:

1. Sign in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** $\rightarrow$ **Blueprint** (or **Web Service**).
   - If using **Blueprint**, select your repo; Render will automatically detect [`render.yaml`](./render.yaml).
   - If using **Web Service**:
     - **Build Command:** `npm install --include=dev && npm run build`
     - **Start Command:** `npm start`
3. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `JWT_SECRET` = `(generate or paste secret)`
   - `MONGODB_URI` = *(Copy the exact connection string from Atlas → Connect → Connect your application → Node.js driver)*
4. Click **Deploy**.
   - Render will build the Vite frontend into `dist/`.
   - Express serves both `/api/*` and the static React SPA from `dist/` on the same URL.

---

## Model C: Deploy Full-Stack on Vercel (Using Serverless Functions)

1. Sign in to [Vercel Dashboard](https://vercel.com/).
2. Import `dilipyadav756/tuition-management-app`.
3. Framework Preset: `Vite`.
4. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `edumaster_production_secure_jwt_secret_key_2026_xyz987`
   - `MONGODB_URI` = *(Copy the exact connection string from Atlas → Connect → Connect your application → Node.js driver)*
5. Click **Deploy**.
   - Vercel builds the React frontend to `dist/`.
   - [`vercel.json`](./vercel.json) routes all `/api/*` requests to the serverless handler [`api/index.js`](./api/index.js).

---

## Important MongoDB Atlas Network Access Rule

Before deploying, ensure your MongoDB Atlas cluster allows incoming connections from Render / Vercel:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Go to **Security** $\rightarrow$ **Network Access**.
3. Click **Add IP Address**.
4. Click **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Confirm**.
*(Since cloud platforms like Vercel and Render use dynamic outbound IP addresses, `0.0.0.0/0` is required for them to connect to your Atlas cluster).*

