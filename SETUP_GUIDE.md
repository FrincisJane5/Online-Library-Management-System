# Local Development Setup Guide

## Prerequisites
- XAMPP (with MySQL and PHP)
- Node.js 18+
- Composer

---

## Backend Setup (Laravel + Sanctum)

### 1. **Start XAMPP MySQL**
   - Open XAMPP Control Panel
   - Click **Start** on MySQL
   - Verify the green indicator appears next to MySQL
   - Verify `DB_HOST=127.0.0.1` and `DB_PORT=3306` in `.env`

### 2. **Create the Database**
   ```bash
   cd backend
   
   # Option A: Using MySQL CLI
   mysql -u root -e "CREATE DATABASE IF NOT EXISTS olms;"
   
   # Option B: Using PHP
   php artisan db:create
   ```

### 3. **Install Backend Dependencies**
   ```bash
   cd backend
   composer install
   php artisan cache:clear
   php artisan config:clear
   ```

### 4. **Run Database Migrations**
   ```bash
   php artisan migrate --force
   ```

### 5. **Start Laravel Development Server**
   ```bash
   php artisan serve --host=127.0.0.1 --port=8000
   ```
   - Server will be available at: `http://127.0.0.1:8000`
   - API endpoints: `http://127.0.0.1:8000/api/*`

---

## Frontend Setup (React + Vite)

### 1. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

### 2. **.env Configuration**
   Create `.env.local` in the root directory:
   ```
   VITE_API_URL=http://127.0.0.1:8000
   ```

### 3. **Start Vite Dev Server**
   ```bash
   npm run dev
   ```
   - Server will be available at: `http://localhost:5173` (or `http://127.0.0.1:5173`)

---

## Testing the Setup

### 1. **Test Backend API**
   ```bash
   # In a new terminal, from the backend directory
   php artisan tinker
   
   # In tinker shell:
   >>> DB::connection()->getPdo()
   >>> // Should not throw an error
   >>> exit()
   ```

### 2. **Test CSRF Token Endpoint**
   ```bash
   curl -i http://127.0.0.1:8000/sanctum/csrf-cookie
   # Should return 204 No Content with Set-Cookie headers
   ```

### 3. **Test API Connection from Frontend**
   - Open your frontend at http://localhost:5173
   - Check browser DevTools → Network tab
   - Make any API call and verify:
     - ✅ CORS headers are present
     - ✅ CSRF token is sent
     - ✅ Status is 200 (not 401/403)

---

## Troubleshooting

### Issue: "Connection Refused" (SQLSTATE[HY000] [2002])

**Check 1: MySQL is Running**
```bash
# Windows PowerShell - verify process is running
Get-Process | Select-String mysql

# Or use XAMPP Control Panel - MySQL indicator should be GREEN
```

**Check 2: Correct Database Configuration (.env)**
```
DB_CONNECTION=mysql      # Must be mysql, not sqlite
DB_HOST=127.0.0.1        # Localhost
DB_PORT=3306             # Default MySQL port
DB_DATABASE=olms         # Database name that exists
DB_USERNAME=root         # XAMPP default
DB_PASSWORD=             # Empty (XAMPP default)
```

**Check 3: Database Exists**
```bash
mysql -u root -e "SHOW DATABASES;" | grep olms
# Should show 'olms' in output
```

**Check 4: Restart MySQL**
```bash
# XAMPP Control Panel: Click Stop MySQL, wait, then click Start
# OR use command line:
# For Windows with XAMPP: net stop MySQL80 && net start MySQL80
```

**Check 5: Clear Laravel Cache**
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Issue: CORS Errors

**Verify cors.php configuration:**
```php
'allowed_origins' => [
    'http://localhost:5173',    // Vite dev server
    'http://127.0.0.1:5173',    // IP variant
    'http://localhost:3000',    // Alternative port
],
'supports_credentials' => true,  // Must be true for Sanctum
```

**Restart Laravel server:**
```bash
php artisan serve --host=127.0.0.1 --port=8000
```

### Issue: CSRF Token Not Sent

**The frontend axios is configured correctly in `src/api/axios.ts`:**
- ✅ `initializeCsrfToken()` must be called on app startup
- ✅ Request interceptor adds `X-CSRF-TOKEN` header
- ✅ Response interceptor handles 401 errors

**Add to your App.tsx or main component:**
```typescript
useEffect(() => {
    initializeCsrfToken();
}, []);
```

---

## API Routes Example

### Test Endpoint
```bash
curl http://127.0.0.1:8000/api/test
# Response: "API WORKING"
```

### Get Books
```bash
curl http://127.0.0.1:8000/api/books
```

### Get Attendances
```bash
curl http://127.0.0.1:8000/api/attendance
```

---

## Development Tips

1. **Keep both servers running** during development:
   - Laravel server: `php artisan serve`
   - Vite dev server: `npm run dev`

2. **Enable debug mode** for better error messages:
   - Set `APP_DEBUG=true` in `.env`
   - Set `LOG_LEVEL=debug` in `.env`

3. **Clear caches frequently** when making config changes:
   ```bash
   php artisan cache:clear
   php artisan config:clear
   ```

4. **Test API calls with cURL** before trying in frontend:
   ```bash
   curl -H "Content-Type: application/json" \
        -H "X-Requested-With: XMLHttpRequest" \
        http://127.0.0.1:8000/api/test
   ```

---

## File Modifications Summary

The following files have been updated for proper setup:

### Backend
- ✅ `backend/.env` - Added `DB_SOCKET` (empty for TCP connection)
- ✅ `backend/config/database.php` - Changed default to `mysql`
- ✅ `backend/config/cors.php` - Enhanced CORS configuration
- ✅ `backend/bootstrap/app.php` - Added Sanctum middleware (`statefulApi()`)
- ✅ `backend/app/Http/kernel.php` - Proper middleware groups for Sanctum

### Frontend
- ✅ `src/api/axios.ts` - Complete refactor with:
  - CSRF token initialization
  - Request interceptors for token injection
  - Response interceptors for error handling
  - TypeScript types for API responses

---

## Next Steps

1. ✅ Ensure MySQL is running (green in XAMPP)
2. ✅ Create the `olms` database
3. ✅ Run migrations: `php artisan migrate`
4. ✅ Start Laravel server: `php artisan serve`
5. ✅ Start Vite server: `npm run dev`
6. ✅ Call `initializeCsrfToken()` in your React app
7. ✅ Test API endpoints from browser DevTools

---

## Support

If issues persist:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check browser console for CORS errors
3. Verify MySQL is running and accessible
4. Clear all caches and restart servers
5. Ensure `.env` has `DB_CONNECTION=mysql` (not sqlite)
