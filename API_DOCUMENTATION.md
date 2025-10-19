# 📚 API Documentation

This document provides comprehensive API documentation for the Wathiq Transport Management System.

## 🔗 Base URLs

- **Development**: `http://localhost:8080`
- **Production**: `https://your-domain.com`

## 🔐 Authentication

### Authentication Flow
The application uses Supabase Auth for authentication with JWT tokens.

### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 📊 Database Schema

### Core Tables

#### `user_roles`
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager')),
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `notifications`
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  is_broadcast BOOLEAN DEFAULT FALSE,
  type TEXT NOT NULL CHECK (type IN ('success', 'error', 'warning', 'info')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Business Data Tables
- `finance_entries` - Financial transactions
- `sales_entries` - Sales records
- `operations_entries` - Operational data
- `marketing_entries` - Marketing activities
- `customers_entries` - Customer information
- `suppliers_entries` - Supplier data

## 🔌 API Endpoints

### Authentication Endpoints

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@wathiq.com",
  "password": "password"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@wathiq.com",
    "role": "admin"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### User Management

#### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Admin User",
  "email": "admin@wathiq.com",
  "role": "admin",
  "permissions": ["read", "write", "delete"]
}
```

#### Update User Profile
```http
PUT /api/user/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Name"
}
```

### Notifications

#### Get Notifications
```http
GET /api/notifications
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "success",
      "title": "تم إنشاء تقرير PDF",
      "message": "تم إنشاء التقرير بنجاح",
      "read": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "unread_count": 5
}
```

#### Mark Notification as Read
```http
PUT /api/notifications/{id}/read
Authorization: Bearer <jwt_token>
```

#### Create Notification
```http
POST /api/notifications
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "type": "info",
  "title": "New Notification",
  "message": "This is a test notification",
  "is_broadcast": false
}
```

### Finance Management

#### Get Finance Entries
```http
GET /api/finance
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Number of items per page
- `start_date` (string): Filter by start date (ISO format)
- `end_date` (string): Filter by end date (ISO format)
- `category` (string): Filter by category

**Response:**
```json
{
  "entries": [
    {
      "id": "uuid",
      "date": "2024-01-01",
      "description": "Revenue from Transport",
      "amount": 5000.00,
      "category": "revenue",
      "type": "income",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  },
  "summary": {
    "total_income": 50000.00,
    "total_expenses": 30000.00,
    "net_profit": 20000.00
  }
}
```

#### Create Finance Entry
```http
POST /api/finance
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "date": "2024-01-01",
  "description": "New Revenue",
  "amount": 1000.00,
  "category": "revenue",
  "type": "income"
}
```

#### Update Finance Entry
```http
PUT /api/finance/{id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "description": "Updated Description",
  "amount": 1500.00
}
```

#### Delete Finance Entry
```http
DELETE /api/finance/{id}
Authorization: Bearer <jwt_token>
```

### Sales Management

#### Get Sales Entries
```http
GET /api/sales
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "entries": [
    {
      "id": "uuid",
      "customer_name": "Customer Name",
      "service_type": "Transport Service",
      "amount": 2000.00,
      "date": "2024-01-01",
      "status": "completed",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "summary": {
    "total_sales": 100000.00,
    "completed_sales": 80000.00,
    "pending_sales": 20000.00
  }
}
```

#### Create Sales Entry
```http
POST /api/sales
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "customer_name": "New Customer",
  "service_type": "Transport Service",
  "amount": 1500.00,
  "date": "2024-01-01",
  "status": "pending"
}
```

### Operations Management

#### Get Operations Entries
```http
GET /api/operations
Authorization: Bearer <jwt_token>
```

#### Create Operations Entry
```http
POST /api/operations
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "operation_type": "Maintenance",
  "description": "Vehicle maintenance",
  "cost": 500.00,
  "date": "2024-01-01",
  "status": "completed"
}
```

### Marketing Management

#### Get Marketing Entries
```http
GET /api/marketing
Authorization: Bearer <jwt_token>
```

#### Create Marketing Entry
```http
POST /api/marketing
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "campaign_name": "New Campaign",
  "description": "Marketing campaign description",
  "budget": 2000.00,
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "status": "active"
}
```

### Customer Management

#### Get Customers
```http
GET /api/customers
Authorization: Bearer <jwt_token>
```

#### Create Customer
```http
POST /api/customers
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+1234567890",
  "address": "Customer Address",
  "notes": "Customer notes"
}
```

### Supplier Management

#### Get Suppliers
```http
GET /api/suppliers
Authorization: Bearer <jwt_token>
```

#### Create Supplier
```http
POST /api/suppliers
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Supplier Name",
  "contact_person": "Contact Person",
  "email": "supplier@example.com",
  "phone": "+1234567890",
  "address": "Supplier Address",
  "services": "Service Description"
}
```

### Reports & Analytics

#### Generate Report
```http
POST /api/reports/generate
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "report_type": "finance",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "format": "pdf"
}
```

**Response:**
```json
{
  "report_id": "uuid",
  "status": "generating",
  "download_url": null,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Get Report Status
```http
GET /api/reports/{id}/status
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "report_id": "uuid",
  "status": "completed",
  "download_url": "https://example.com/reports/report.pdf",
  "created_at": "2024-01-01T00:00:00Z",
  "completed_at": "2024-01-01T00:01:00Z"
}
```

### Charts & Analytics

#### Get Chart Data
```http
GET /api/charts/{chart_type}
Authorization: Bearer <jwt_token>
```

**Chart Types:**
- `finance-overview`
- `sales-trends`
- `customer-growth`
- `supplier-performance`

**Response:**
```json
{
  "chart_type": "finance-overview",
  "data": [
    {
      "month": "2024-01",
      "income": 50000,
      "expenses": 30000,
      "profit": 20000
    }
  ],
  "summary": {
    "total_income": 600000,
    "total_expenses": 360000,
    "net_profit": 240000
  }
}
```

## 🔒 Security & Permissions

### Role-Based Access Control

#### Admin Permissions
- Full access to all endpoints
- User management
- System configuration
- All CRUD operations

#### Manager Permissions
- Read access to all data
- Limited write access
- Report generation
- Customer/Supplier management

### Row Level Security (RLS)

All database queries are protected by RLS policies:

```sql
-- Example RLS policy
CREATE POLICY "Users can read their own data" ON finance_entries
FOR SELECT TO authenticated
USING (auth.uid() = user_id);
```

## 📝 Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Common Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## 🔄 Real-time Updates

### WebSocket Connection
```javascript
// Connect to Supabase realtime
const supabase = createClient(url, key);

// Subscribe to notifications
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications'
  }, (payload) => {
    console.log('New notification:', payload.new);
  })
  .subscribe();
```

## 📊 Rate Limiting

- **Authentication**: 5 requests per minute
- **API Calls**: 100 requests per 15 minutes
- **Report Generation**: 10 requests per hour

## 🧪 Testing

### Test Endpoints
```http
# Health check
GET /health

# Database connectivity
GET /health/db

# Authentication test
GET /auth/test
```

### Test Data
Use the test data endpoints for development:
```http
# Create test data
POST /api/test/data
Authorization: Bearer <jwt_token>

# Clear test data
DELETE /api/test/data
Authorization: Bearer <jwt_token>
```

---

## 📞 Support

For API support and questions:
- **Documentation**: This file
- **Issues**: GitHub Issues
- **Email**: api-support@wathiq.com

**Last Updated**: January 2024
**API Version**: v1.0.0
