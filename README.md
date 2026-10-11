# Pruvate Platform — Web Frontend (React 18 + Vite)

Modern, glassmorphic dark-navy dashboard and Lua script marketplace for Pruvate Platform.

## 🚀 Vercel Deployment

This frontend is configured for deployment on Vercel with automatic API rewrites and SPA client-side routing via `vercel.json`.

### 1. Import to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import repository `eshankhanmaim-rgb/legit`.
3. Vercel automatically selects the **Vite** framework preset:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 2. Environment Variables (Optional)
By default, `vercel.json` automatically proxies all `/api/*` requests directly to `https://legit-flax.vercel.app/api/*`.
If you wish to configure an explicit API URL or client Firebase parameters, add:

```env
VITE_API_URL=https://legit-flax.vercel.app
VITE_API_BASE_URL=/api/v1
```

### 3. Deploy
Click **Deploy**. Your frontend is immediately live and connected to your backend API.
