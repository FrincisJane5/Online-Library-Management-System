# 🎪 Demo Mode Configuration Guide

## Overview

Demo mode disables CSRF protection and uses permissive CORS for easy local testing. All security measures are relaxed for demonstration purposes.

⚠️ **WARNING**: Never use demo mode in production!

---

## Quick Start

### Step 1: Enable Demo Mode on Backend

**File**: `backend/.env`
```env
DEMO_MODE=true
```

### Step 2: Enable Demo Mode on Frontend

**File**: `.env.local` (create if doesn't exist)
```env
VITE_API_URL=http://127.0.0.1:8000
VITE_DEMO_MODE=true
```

### Step 3: Restart Servers

```bash
# Terminal 1: Backend (Ctrl+C to stop, then restart)
cd backend
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2: Frontend (Ctrl+C to stop, then restart)
npm run dev
```

### Step 4: Verify Demo Mode

Open browser DevTools (F12) and check the console:

```javascript
// In browser console, run:
import { getMode } from './api/axios';
getMode();

// Output:
{
  mode: "DEMO",
  csrfEnabled: false,
  credentialsEnabled: false,
  apiUrl: "http://127.0.0.1:8000"
}
```

Or check React Network tab:
- ❌ No CSRF token header sent
- ❌ No credentials/cookies sent
- ✅ CORS headers present

---

## What's Changed in Demo Mode

### 1. **Backend: CSRF Verification Disabled**

**File**: `app/Http/Middleware/VerifyCsrfToken.php`

```php
public function handle($request, $next)
{
    // Demo mode: skip CSRF verification entirely
    if ($this->isDemo()) {
        return $next($request);
    }
    return parent::handle($request, $next);
}

protected function isDemo(): bool
{
    return env('DEMO_MODE', false) === true || env('DEMO_MODE') === 'true';
}
```

**Effect**: All POST/PUT/DELETE requests don't require CSRF tokens.

### 2. **Backend: CORS Configuration Permissive**

**File**: `config/cors.php`

```php
'paths' => ['api/*', 'sanctum/*', '*'],  // Allow ALL paths
'allowed_methods' => ['*'],               // Allow ALL methods
'allowed_origins' => [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://localhost',
    'http://127.0.0.1',
],
'allowed_origins_patterns' => [
    '/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/',  // Any port
],
'allowed_headers' => ['*'],               // Allow ALL headers
'supports_credentials' => true,           // Allow cookies
```

**Effect**: Any origin can make requests to the API.

### 3. **Backend: ForceCors Middleware Updated**

**File**: `app/Http/Middleware/ForceCors.php`

```php
// Dynamically set credentials based on DEMO_MODE
$allowCredentials = env('DEMO_MODE', false) ? 'true' : 'false';

return $response
    ->header('Access-Control-Allow-Credentials', $allowCredentials)
    ->header('Access-Control-Allow-Origin', $origin);
```

**Effect**: CORS headers respond to any origin request.

### 4. **Frontend: Axios Behavior Changes**

**File**: `src/api/axios.ts`

```typescript
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
    // In demo mode, disable credentials
    withCredentials: !DEMO_MODE,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

export const initializeCsrfToken = async (): Promise<void> => {
    // Skip CSRF initialization in demo mode
    if (DEMO_MODE) {
        console.log('⚠️  Demo mode: CSRF token skipped');
        return;
    }
    // ... production code
};
```

**Effect**:
- ❌ Doesn't send credentials/cookies
- ❌ Doesn't fetch or inject CSRF tokens
- ✅ Still makes API calls successfully

---

## API Call Flow in Demo Mode

### Without Demo Mode (Production)
```
1. App starts
2. Call initializeCsrfToken() → GET /sanctum/csrf-cookie
3. Receive XSRF-TOKEN cookie
4. Make API request with X-CSRF-TOKEN header
5. Server verifies CSRF token
6. Request succeeds
```

### With Demo Mode (Demo)
```
1. App starts
2. initializeCsrfToken() logs "Demo mode: CSRF token skipped" → Returns immediately
3. Make API request (no CSRF token)
4. Server skips CSRF verification (DEMO_MODE=true)
5. CORS middleware allows request (permissive config)
6. Request succeeds
```

---

## Making API Calls in Demo Mode

No changes needed! Your existing code works the same:

```typescript
// In any React component
import api, { apiCall } from '../api/axios';

// Example 1: Using api directly
const response = await api.get('/api/books');

// Example 2: Using apiCall utility
const books = await apiCall<Book[]>('get', '/api/books');

// Example 3: Creating data
await api.post('/api/books', {
    title: 'New Book',
    author: 'Author Name',
    // ... no CSRF token needed in demo mode
});
```

All requests work identically whether CSRF is enabled or disabled!

---

## Testing Different Scenarios

### Test 1: Verify Demo Mode is Active

```bash
# In backend directory
cd backend

# Check .env
grep DEMO_MODE .env
# Output: DEMO_MODE=true

# Check current mode via Laravel
php artisan tinker
>>> env('DEMO_MODE')
// Output: true
```

### Test 2: Make API Request Without CSRF Token

```bash
# This should work in demo mode
curl.exe -X POST http://127.0.0.1:8000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","author":"Me","category":"Test","total":5}'

# Without demo mode, this would return 419 (CSRF token mismatch)
# With demo mode, should return 201 or 200
```

### Test 3: Check CORS Headers

```bash
curl.exe -i http://127.0.0.1:8000/api/books

# In demo mode, should see:
# Access-Control-Allow-Origin: <origin>
# Access-Control-Allow-Credentials: true
```

### Test 4: Browser DevTools Network Tab

1. Open `http://localhost:5173`
2. Press F12 → Network tab
3. Make any API call
4. Click on the network request
5. Check Headers:
   - ❌ No `X-CSRF-TOKEN` header (demo mode)
   - ✅ `Access-Control-Allow-Origin` in response
   - ✅ No credentials cookies sent (unless Sanctum disabled)

---

## Switching Back to Production Mode

When ready to use CSRF protection again:

### Step 1: Disable Demo Mode on Backend

**File**: `backend/.env`
```env
DEMO_MODE=false
# or remove the line entirely
```

### Step 2: Disable Demo Mode on Frontend

**File**: `.env.local`
```env
VITE_DEMO_MODE=false
# or remove the line
```

### Step 3: Update CORS Config (if needed)

**File**: `config/cors.php`
```php
'allowed_origins' => [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    // Remove or restrict to actual origins
],
```

### Step 4: Re-enable Sanctum

**File**: `src/App.tsx`
```typescript
useEffect(() => {
    initializeCsrfToken(); // Now actually fetches token
}, []);
```

### Step 5: Restart Servers

```bash
php artisan serve --host=127.0.0.1 --port=8000
npm run dev
```

---

## Common Issues in Demo Mode

### Issue: Still getting 403 CSRF errors

**Solution 1**: Clear browser cache
```bash
# Delete .env and restart
rm backend\.env
# Re-create it with DEMO_MODE=true
```

**Solution 2**: Restart Laravel server
```bash
# Kill existing server (Ctrl+C), then:
php artisan cache:clear
php artisan config:clear
php artisan serve --host=127.0.0.1 --port=8000
```

**Solution 3**: Check env is actually set
```bash
php artisan tinker
>>> env('DEMO_MODE')
// Should output: true
```

### Issue: CORS errors still appearing

**Check 1**: Frontend is sending to correct backend URL
```typescript
// In browser console:
import api from './api/axios';
console.log(api.defaults.baseURL);
// Should be: http://127.0.0.1:8000
```

**Check 2**: Backend CORS headers are being sent
```bash
curl.exe -i http://127.0.0.1:8000/api/test
# Look for: Access-Control-Allow-Origin header
```

**Check 3**: Refresh browser and clear cache
```
Ctrl+Shift+Delete → Clear all → Ctrl+Shift+R (hard refresh)
```

### Issue: POST requests failing with 405 Method Not Allowed

**Solution**: Make sure ForceCors middleware is enabled in kernel.php

**File**: `app/Http/kernel.php`
```php
protected $middleware = [
    \App\Http\Middleware\ForceCors::class,  // Must be here
    \Illuminate\Http\Middleware\HandleCors::class,
];
```

---

## Security Checklist for Production Migration

- [ ] Set `DEMO_MODE=false` in backend `.env`
- [ ] Remove `VITE_DEMO_MODE=true` from frontend `.env.local`
- [ ] Restrict `allowed_origins` in `config/cors.php` to specific domains
- [ ] Verify `VerifyCsrfToken` middleware is enforcing CSRF checks
- [ ] Verify Sanctum is properly configured for authentication
- [ ] Test CSRF token flow in browser (should see token in headers)
- [ ] Test CORS errors for unauthorized origins
- [ ] Run Laravel security checks: `php artisan tinker` → `DB::connection()->getPdo()`

---

## Summary

| Aspect | Demo Mode | Production |
|--------|-----------|-----------|
| CSRF Check | ❌ Disabled | ✅ Enabled |
| CORS Origins | ✅ Allow All | 🔒 Whitelist Only |
| withCredentials | ❌ false | ✅ true |
| X-CSRF-TOKEN | ❌ Not sent | ✅ Sent |
| /sanctum/csrf-cookie | ⏭️ Skipped | ✅ Called |
| Use Case | 🎪 Demo/Testing | 🔐 Live/Production |

---

## Next Steps

1. ✅ Enable `DEMO_MODE=true` in `backend/.env`
2. ✅ Add `VITE_DEMO_MODE=true` to `.env.local`
3. ✅ Restart both servers
4. ✅ Test API calls from React
5. ✅ Check browser DevTools for no CSRF errors
6. ✅ When ready for production, switch modes back

Happy demoing! 🚀
