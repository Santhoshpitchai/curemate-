# Curemate Health Hub

Curemate is a comprehensive online healthcare platform that connects users with healthcare products, services, and vendors.

## Supabase Integration

This project uses Supabase for authentication and database functionality. The following features are implemented:

- User authentication (signup, login, logout)
- Vendor authentication (signup, login, logout)
- User and vendor profiles
- Database integration

### Setup Instructions

1. **Supabase Configuration**

   The project is already configured with a Supabase project. The configuration is stored in `js/supabase-config.js`.

2. **Authentication**

   - User authentication is handled in `js/auth.js` and `js/user-auth.js`
   - Vendor authentication is handled in `js/auth.js` and `js/vendor-auth.js`

3. **Database Schema**

   The database has two main tables:
   
   - `users` - Stores user information
     - id (UUID, primary key)
     - email (text)
     - first_name (text)
     - last_name (text)
     - phone (text, optional)
     - created_at (timestamp)
   
   - `vendors` - Stores vendor information
     - id (UUID, primary key)
     - email (text)
     - first_name (text)
     - last_name (text)
     - business_name (text)
     - phone (text, optional)
     - created_at (timestamp)

   Both tables have relationships with the Supabase auth.users table for authentication.

### Usage

#### User Authentication

```javascript
// Initialize Supabase
initSupabase();

// Sign up a new user
const { user, error } = await userAuth.signUp(
  'user@example.com',
  'password123',
  'John',
  'Doe',
  '1234567890'
);

// Sign in a user
const { session, user, error } = await userAuth.signIn(
  'user@example.com',
  'password123'
);

// Sign out a user
const { error } = await userAuth.signOut();

// Get user profile
const { profile, error } = await userAuth.getProfile();
```

#### Vendor Authentication

```javascript
// Initialize Supabase
initSupabase();

// Sign up a new vendor
const { user, error } = await vendorAuth.signUp(
  'vendor@example.com',
  'password123',
  'John',
  'Doe',
  'My Business',
  '1234567890'
);

// Sign in a vendor
const { session, user, error, vendor } = await vendorAuth.signIn(
  'vendor@example.com',
  'password123'
);

// Sign out a vendor
const { error } = await vendorAuth.signOut();

// Get vendor profile
const { profile, error } = await vendorAuth.getProfile();
```

#### Helper Functions

```javascript
// Check if a user is logged in
const isLoggedIn = await isLoggedIn();

// Get the current user
const user = await getCurrentUser();

// Check if the current user is a vendor
const isVendor = await isVendor();
```

## Project Structure

- `index.html` - Main landing page
- `user-login.html` - User login page
- `user-signup.html` - User signup page
- `vendor-login.html` - Vendor login page
- `vendor-signup.html` - Vendor signup page
- `vendor-dashboard.html` - Vendor dashboard
- `js/`
  - `supabase-config.js` - Supabase configuration
  - `auth.js` - Authentication functions
  - `user-auth.js` - User authentication UI
  - `vendor-auth.js` - Vendor authentication UI
  - `main.js` - Main JavaScript file
  - `cart.js` - Shopping cart functionality
  - `vendor-dashboard.js` - Vendor dashboard functionality
  - `vendor-products.js` - Vendor products management
  - `vendor-orders.js` - Vendor orders management
- `css/`
  - `styles.css` - Main CSS file
- `img/` - Image assets

## Development

To run the project locally, simply open the `index.html` file in a web browser.

## License

This project is licensed under the MIT License.