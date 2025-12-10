# Shree Admin Panel

A modern React.js admin dashboard for managing industrial equipment manufacturing operations.

## Features

- **Dashboard**: Overview with key metrics, revenue trends, and alerts
- **Product Management**: Manage inventory across categories (Boiling House, Material Handling, Mill House, etc.)
- **Order Management**: Track orders from pending to delivered
- **Quotation System**: Create and manage quotations with status tracking
- **Customer Database**: Manage customer information and interaction history
- **Service Management**: Track after-sales service requests and engineer assignments
- **Analytics**: Business insights with charts and performance metrics
- **Settings**: Configure company information and system settings

## Tech Stack

- React 18
- React Router v6
- Recharts (for data visualization)
- Lucide React (icons)
- CSS3 (custom styling)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Login

For demo purposes, use any email and password to login.

## Project Structure

```
src/
├── components/
│   └── Layout.js          # Main layout with sidebar
├── pages/
│   ├── Dashboard.js       # Main dashboard
│   ├── Products.js        # Product management
│   ├── Orders.js          # Order tracking
│   ├── Quotations.js      # Quotation management
│   ├── Customers.js       # Customer database
│   ├── Services.js        # Service requests
│   ├── Analytics.js       # Reports and analytics
│   └── Settings.js        # System settings
└── App.js                 # Main app component
```

## Next Steps

To connect to a real backend:

1. Replace mock data with API calls using axios
2. Implement proper authentication with JWT tokens
3. Add form validation
4. Implement CRUD operations for all modules
5. Add file upload functionality for product images and brochures
6. Integrate email/SMS notifications
7. Add export functionality for reports

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.
