# Frontend-Backend Connection Guide

## ✅ Backend Status: DEPLOYED & WORKING

Your backend is successfully deployed at:
**https://igcse-backend-public-427ejh541-weiyou-cuis-projects.vercel.app**

## 🔧 Step 2: Environment Configuration (COMPLETED)

Your frontend `.env` file has been configured with:
```
VITE_API_URL=https://igcse-backend-public-427ejh541-weiyou-cuis-projects.vercel.app
```

## 🧪 Step 3: API Testing Results

### Working Endpoints:
- ✅ **Health Check**: `/api/health.js`
  - URL: `https://igcse-backend-public-427ejh541-weiyou-cuis-projects.vercel.app/api/health.js`
  - Response: `{"status":"ok","message":"Backend is running","timestamp":"..."}`

### Important Notes:
1. **File Extensions Required**: All API endpoints must include the `.js` extension
2. **CORS Configured**: Backend accepts requests from `https://igcse-frontend.vercel.app`
3. **Proxy Required**: Your local environment needs proxy settings for external requests

## 📝 Frontend Integration Instructions

### 1. Update API Utility Files

Your frontend has multiple API utility files that need to be updated:

#### In `src/utils/api.js` (line 6):
```javascript
// Change this:
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// To this:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

#### In `src/utils/api.ts` (line 2):
```typescript
// Change this:
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// To this:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

### 2. Update API Endpoint Calls

Since Vercel serverless functions require `.js` extensions, update your API calls:

```javascript
// Example: Health check
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/health.js`);

// Example: Auth (when fixed)
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth.js`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

### 3. Available Endpoints

Currently working:
- `/api/health.js` - Health check ✅

Need backend fixes:
- `/api/auth.js` - Authentication (Express router format needs conversion)
- `/api/dashboard.js` - Dashboard data
- `/api/courses.js` - Course data

## 🚀 Next Steps

1. **Test the health endpoint** from your frontend:
   ```javascript
   fetch(`${import.meta.env.VITE_API_URL}/api/health.js`)
     .then(res => res.json())
     .then(data => console.log('Backend connected:', data));
   ```

2. **Update your API utility files** as shown above

3. **Start your frontend development server**:
   ```bash
   npm run dev
   ```

4. **Test the connection** in your browser console

## 🔍 Troubleshooting

- **Proxy Issues**: If you have network proxy settings, ensure they're configured for your development environment
- **CORS Errors**: The backend is configured for `https://igcse-frontend.vercel.app` - make sure your deployed frontend uses this URL
- **404 Errors**: Remember to include the `.js` extension in all API calls

## 📞 Support

If you encounter issues:
1. Check browser console for error messages
2. Verify the `.env` file is loaded correctly
3. Test the health endpoint directly in your browser: 
   `https://igcse-backend-public-427ejh541-weiyou-cuis-projects.vercel.app/api/health.js` 