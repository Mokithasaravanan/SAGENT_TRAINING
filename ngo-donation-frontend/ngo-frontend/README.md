# NGO Donation Hub — React Frontend

A production-ready, visually stunning React.js frontend for the NGO Donation Management System.

---

## Tech Stack
- **React 18** + **Vite**
- **Tailwind CSS** — custom dark theme, glassmorphism
- **Framer Motion** — page transitions, animations
- **Axios** — API calls to Spring Boot backend
- **EmailJS** — real email from contact form
- **React Hot Toast** — beautiful notifications
- **React CountUp** — animated stat counters
- **React Icons** — icon library

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open in browser
http://localhost:3000
```

---

## Connect to Backend

The backend URL is set in `src/services/api.js`:
```js
baseURL: 'http://localhost:8081'
```
Change this if your Spring Boot app runs on a different port.

---

## EmailJS Setup (Contact Form)

1. Create a free account on EmailJS
2. Create a **Service** (Gmail, Outlook, etc.)
3. Create an **Email Template** with these variables:
   - `{{from_name}}` — sender name
   - `{{from_email}}` — sender email
   - `{{subject}}` — subject
   - `{{message}}` — message body
4. Copy `.env.example` to `.env.local` and set:
```env
VITE_EJS_SERVICE_ID=your_service_id
VITE_EJS_TEMPLATE_ID=your_template_id
VITE_EJS_PUBLIC_KEY=your_public_key
```

---

## Live Map (Mapbox Optional)

The live NGO/volunteer maps use Mapbox tiles when a token is provided.  
If no token is set, the UI falls back to free Esri satellite tiles.

Add to `.env.local`:
```env
VITE_MAPBOX_TOKEN=your_mapbox_public_token
VITE_MAPBOX_STYLE=mapbox/light-v11
```

---

## Pages

| Route        | Page                  | Access        |
|--------------|-----------------------|---------------|
| /login       | Login                 | Public        |
| /register    | Register              | Public        |
| /            | Home (Donor Wall)     | Public        |
| /ngos        | NGO List              | Public        |
| /campaigns   | Campaigns             | Public        |
| /donate      | Donate                | DONOR / ADMIN |
| /history     | Donation History      | DONOR / ADMIN |
| /volunteer   | Volunteer Tasks       | VOLUNTEER / ADMIN |
| /admin       | Admin Dashboard       | ADMIN only    |
| /contact     | Contact               | Public        |

---

## Build for Production

```bash
npm run build
```
Output goes to `dist/` folder — ready to deploy on **Vercel** or **Netlify**.

---

## Deploy on Vercel

```bash
npm install -g vercel
vercel
```

## Deploy on Netlify

Drag and drop the `dist/` folder on https://app.netlify.com

---

## Test Credentials (after running backend)

| Role      | Email                   | Password    |
|-----------|-------------------------|-------------|
| Admin     | admin@ngo.com           | admin123    |
| Donor     | john@example.com        | password123 |
| Volunteer | volunteer@example.com   | password123 |
