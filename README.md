# Military Food Inventory Management System

A comprehensive React-based military food inventory management system with multi-branch support, vendor management, and automated email notifications.

## Features

- **Multi-Branch Support**: Navy, Air Defence, and Army divisions
- **Real-time Stock Tracking**: Monitor inventory levels across locations
- **Automated Order Management**: Auto-triggers low stock orders
- **Vendor Portal**: Vendor authentication with OTP verification
- **Email Notifications**: Claude AI-powered email system
- **Audit Trail**: Complete stock movement history
- **Role-Based Access**: Admin, Officer, and Vendor roles

## Demo Credentials

- **Admin**: admin@mil.gov.in / admin123
- **Officer**: officer@mil.gov.in / officer123
- **Vendor**: vendor1@supremefoods.mil / vendor123

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm start
   ```

3. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.js
│   ├── LoginPage.js
│   ├── InventoryView.js
│   ├── DashboardView.js
│   ├── VendorView.js
│   └── ...
├── constants/          # Data and constants
│   └── data.js
├── utils/             # Helper functions
│   └── helpers.js
├── App.js            # Main app component
└── index.js          # Entry point
public/
└── index.html        # HTML template
```

## Key Features

### Admin Dashboard
- Overview of all inventory
- Low stock alerts
- Pending orders tracker
- Branch-wise stock analysis

### Officer Portal
- View inventory for assigned location
- Checkout items
- Confirm deliveries

### Vendor Portal
- View assigned orders
- OTP verification system
- Delivery tracking

## Usage

1. **Login** with demo credentials
2. **View Inventory** - Browse items by category, priority, or location
3. **Manage Stock** - Checkout or restock items
4. **Track Orders** - Monitor order status from creation to delivery
5. **Email Notifications** - Automatic notifications for critical actions

## Technologies Used

- React 18.2.0
- React Scripts 5.0.1
- Claude AI API (for email generation)

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs tests

## Notes

- The email system requires an active internet connection and Claude API key for full functionality
- Demo email notifications work without API key (simulated)
- All data is stored in local state (no backend database)

## License

Military Use Only - Confidential
