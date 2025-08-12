# Supabase Integration for Curemate Health Hub

## Overview

This document explains the Supabase integration implemented for the Curemate Health Hub application. The integration replaces the previous localStorage-based authentication system with a robust cloud database solution.

## Database Schema

### Users Table
The `users` table stores customer information with the following structure:
- `id` (uuid, primary key) - Auto-generated unique identifier
- `email` (text, unique) - User's email address
- `first_name` (text) - User's first name
- `last_name` (text) - User's last name
- `phone` (text, nullable) - User's phone number
- `created_at` (timestamp) - Account creation timestamp

### Vendors Table
The `vendors` table stores vendor/business information with the following structure:
- `id` (uuid, primary key) - Auto-generated unique identifier
- `email` (text, unique) - Vendor's email address
- `first_name` (text) - Contact person's first name
- `last_name` (text) - Contact person's last name
- `phone` (text, nullable) - Vendor's phone number
- `created_at` (timestamp) - Account creation timestamp

## Configuration

### Environment Variables
The Supabase configuration is stored in the `.env` file:
```
SUPABASE_URL=https://vahhmwunmhkudepqxrir.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Client Initialization
The Supabase client is initialized in `js/main.js`:
```javascript
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2'
const supabase = createClient(supabaseUrl, supabaseKey)
```

## Service Layer

### SupabaseService Class
The `js/supabase-service.js` file contains the `SupabaseService` class that handles all database operations:

#### User Operations
- `createUser(userData)` - Creates a new user in the database
- `getUserByEmail(email)` - Retrieves a user by email address
- `getAllUsers()` - Fetches all users from the database
- `authenticateUser(email, password)` - Authenticates a user (demo implementation)

#### Vendor Operations
- `createVendor(vendorData)` - Creates a new vendor in the database
- `getVendorByEmail(email)` - Retrieves a vendor by email address
- `getAllVendors()` - Fetches all vendors from the database
- `authenticateVendor(email, password)` - Authenticates a vendor (demo implementation)

#### Session Management
- `setUserSession(user, rememberMe)` - Stores user session data
- `setVendorSession(vendor, rememberMe)` - Stores vendor session data
- `getCurrentUser()` - Retrieves current user session
- `getCurrentVendor()` - Retrieves current vendor session
- `clearSession()` - Clears all session data

## Updated Authentication Flow

### User Registration
1. User fills out the signup form on the main site
2. `handleSignup()` function validates the form data
3. System checks if user already exists using `getUserByEmail()`
4. If new user, `createUser()` is called to store in Supabase
5. User is automatically logged in and session is created

### User Login
1. User enters credentials in the login modal
2. `handleLogin()` function validates the form data
3. `authenticateUser()` is called to verify credentials
4. If successful, user session is created and UI is updated

### Vendor Registration
1. Vendor fills out the signup form on vendor-signup.html
2. `handleVendorSignup()` function validates the form data
3. System checks if vendor already exists using `getVendorByEmail()`
4. If new vendor, `createVendor()` is called to store in Supabase
5. Vendor is redirected to login page

### Vendor Login
1. Vendor enters credentials on vendor-login.html
2. `handleVendorLogin()` function validates the form data
3. `authenticateVendor()` is called to verify credentials
4. If successful, vendor session is created and redirected to dashboard

## Files Modified

### HTML Files
- `index.html` - Added Supabase service script and updated to module type
- `vendor-login.html` - Added Supabase service script
- `vendor-signup.html` - Added Supabase service script
- `vendor-dashboard.html` - Added Supabase service script
- `vendor-products.html` - Added Supabase service script
- `vendor-orders.html` - Added Supabase service script

### JavaScript Files
- `js/main.js` - Updated authentication functions to use Supabase
- `js/vendor-auth.js` - Updated vendor authentication to use Supabase
- `js/supabase-service.js` - New service layer for Supabase operations

### New Files
- `test-supabase.html` - Test page for verifying Supabase integration
- `admin-dashboard.html` - Admin dashboard for viewing stored data
- `SUPABASE_INTEGRATION.md` - This documentation file

## Testing

### Test Page (test-supabase.html)
The test page provides:
- Connection status verification
- User and vendor creation forms
- Real-time data display
- Authentication testing buttons

### Admin Dashboard (admin-dashboard.html)
The admin dashboard provides:
- Statistics overview (total users, vendors, recent registrations)
- Real-time data tables for users and vendors
- Auto-refresh functionality
- Manual refresh controls

## Security Considerations

### Current Implementation (Demo)
- Passwords are not hashed (for demo purposes only)
- Authentication accepts any password for existing users
- Uses anonymous key for all operations

### Production Recommendations
1. Implement proper password hashing (bcrypt, Argon2)
2. Use Supabase Auth for secure authentication
3. Implement proper role-based access control
4. Add input validation and sanitization
5. Use service role key only for admin operations
6. Implement rate limiting for authentication attempts

## Data Flow

### Registration Flow
```
User Form → Validation → Check Existing → Create in Supabase → Session Creation → UI Update
```

### Login Flow
```
Login Form → Validation → Authenticate → Session Creation → UI Update/Redirect
```

### Data Retrieval Flow
```
Page Load → Service Ready Check → Database Query → UI Update
```

## Monitoring and Maintenance

### Real-time Monitoring
- Admin dashboard shows live data from Supabase
- Auto-refresh keeps data current
- Error handling displays meaningful messages

### Data Verification
- Test page allows manual verification of operations
- Direct database access through Supabase dashboard
- Console logging for debugging

## Future Enhancements

1. **Enhanced Security**
   - Implement Supabase Auth
   - Add password hashing
   - Implement proper session management

2. **Additional Features**
   - User profiles and preferences
   - Vendor approval workflow
   - Order tracking integration
   - Email notifications

3. **Performance Optimization**
   - Implement caching strategies
   - Add pagination for large datasets
   - Optimize database queries

4. **Analytics**
   - User behavior tracking
   - Registration analytics
   - Performance metrics

## Troubleshooting

### Common Issues
1. **Connection Errors**: Check Supabase URL and keys in .env
2. **CORS Issues**: Ensure domain is added to Supabase settings
3. **Authentication Failures**: Verify user exists in database
4. **Session Issues**: Check browser storage and session management

### Debug Tools
- Browser console for error messages
- Test page for connection verification
- Admin dashboard for data verification
- Supabase dashboard for direct database access
