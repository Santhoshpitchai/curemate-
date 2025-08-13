/**
 * Supabase TypeScript definitions for the database schema
 * This file was automatically generated and should be updated if the schema changes
 */

/**
 * @typedef {Object} Shop
 * @property {string} id - Unique shop ID
 * @property {string} vendor_id - The vendor who owns this shop
 * @property {string} name - Shop name
 * @property {string} address - Street address
 * @property {string} city - City
 * @property {string} state - State or province
 * @property {string} postal_code - Postal code
 * @property {number|null} latitude - Latitude for map location
 * @property {number|null} longitude - Longitude for map location
 * @property {string|null} phone - Contact phone
 * @property {string} created_at - Creation timestamp
 * @property {string|null} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} Product
 * @property {string} id - Unique product ID
 * @property {string} vendor_id - The vendor who owns this product
 * @property {string} shop_id - The shop this product belongs to
 * @property {string} name - Product name
 * @property {string|null} description - Product description
 * @property {string} category - Product category
 * @property {number} price - Product price
 * @property {number} stock - Available inventory
 * @property {string|null} image_url - URL to product image
 * @property {string} created_at - Creation timestamp
 * @property {string|null} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} Order
 * @property {string} id - Unique order ID
 * @property {string} user_id - Customer who placed the order
 * @property {string} vendor_id - Vendor fulfilling the order
 * @property {string} shop_id - Shop where the order was placed
 * @property {number} total_amount - Total order amount
 * @property {string} status - Order status (pending, processing, shipped, delivered, etc)
 * @property {Object|null} shipping_address - Shipping address information
 * @property {string|null} payment_method - Payment method used
 * @property {string} payment_status - Payment status (pending, completed, failed, etc)
 * @property {string} created_at - Creation timestamp
 * @property {string|null} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} OrderItem
 * @property {string} id - Unique order item ID
 * @property {string} order_id - Order this item belongs to
 * @property {string} product_id - Product in this order item
 * @property {number} quantity - Quantity ordered
 * @property {number} unit_price - Price per unit at time of order
 * @property {string} created_at - Creation timestamp
 */

/**
 * @typedef {Object} Vendor
 * @property {string} id - Unique vendor ID
 * @property {string} email - Vendor email
 * @property {string} first_name - Vendor first name
 * @property {string} last_name - Vendor last name
 * @property {string} business_name - Business/store name
 * @property {string|null} phone - Contact phone
 * @property {string} created_at - Creation timestamp
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique user ID
 * @property {string} email - User email
 * @property {string} first_name - User first name
 * @property {string} last_name - User last name
 * @property {string|null} phone - Contact phone
 * @property {string} created_at - Creation timestamp
 */
