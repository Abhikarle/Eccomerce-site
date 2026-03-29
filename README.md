# ModernShop - E-Commerce Platform 🛍️

A full-stack e-commerce application built with modern web technologies. Features user authentication, product search, shopping cart, wishlist, and password recovery functionality.

## 🌟 Features

### User Authentication
- ✅ User Registration & Login
- ✅ JWT Token-based Authentication
- ✅ Forgot Password with Reset Functionality
- ✅ Secure Password Hashing (bcryptjs)
- ✅ User Profile Management

### Shopping Features
- ✅ Browse 10+ Products with Images
- ✅ Real-time Product Search (by name, description, price)
- ✅ Shopping Cart (add, update, remove items)
- ✅ Wishlist (save items for later)
- ✅ Cart Checkout
- ✅ Product Ratings & Reviews Display

### UI/UX
- ✅ Responsive Design
- ✅ Modern, Clean Interface
- ✅ Real-time Notifications
- ✅ Smooth Animations & Transitions
- ✅ Mobile-Friendly

## 📁 Project Structure

```
Ecommerce-site/
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── app.js              # JavaScript functionality
│   ├── styles.css          # Styling
│   ├── package.json        # Frontend dependencies
│   └── server.js           # Simple Express server for static files
├── backend/
│   ├── server.js           # Express API server
│   └── package.json        # Backend dependencies
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Eccomerce-site.git
   cd Eccomerce-site
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start Backend Server** (Terminal 1)
   ```bash
   cd backend
   npm start
   ```
   Backend runs on: `http://localhost:3000`

2. **Start Frontend Server** (Terminal 2)
   ```bash
   cd frontend
   npm start
   ```
   Frontend runs on: `http://localhost:8080`

3. **Open in Browser**
   - Visit: `http://localhost:8080`

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products
- `GET /api/ping` - Health check

### Cart (Requires Authentication)
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3 (with CSS Variables)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons
- Unsplash Images API

### Backend
- Node.js
- Express.js
- bcryptjs (Password hashing)
- jsonwebtoken (JWT authentication)
- CORS

## 📝 Features Implemented

### Authentication System
- Secure user registration with password hashing
- JWT-based login with token storage
- Forgot password functionality with reset tokens
- Protected routes and API endpoints

### Shopping Features
- Real-time product search across name, description, and price
- Add/remove items from cart
- Update cart item quantities
- Wishlist management
- Cart persistence with localStorage

### User Interface
- Responsive header with search and navigation
- Modal-based login, registration, and password reset
- Shopping cart sidebar
- Product grid display
- Real-time notifications
- User menu with logout option

## 🔒 Security Features
- Password hashing with bcryptjs
- JWT token-based authentication
- Protected API endpoints
- Secure token storage

## 🚧 Future Enhancements
- [ ] Product details modal/page
- [ ] Advanced product filtering and sorting
- [ ] Payment integration (Stripe/PayPal)
- [ ] Order history and tracking
- [ ] Product reviews system
- [ ] Admin panel
- [ ] Email notifications
- [ ] Database integration (MongoDB)
- [ ] User profiles
- [ ] Coupon/discount codes

## 📸 Screenshots

### Login Modal
- Clean, modern design
- Forgot password link
- Registration option

### Product Search
- Real-time filtering
- Multiple search criteria
- "No results" message

### Shopping Cart
- Item management
- Quantity adjustment
- Total calculation
- Checkout button

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Created with ❤️ by [Your Name]

## 📞 Support

For issues and questions, please open an issue on the GitHub repository.

## API endpoints
- GET `/api/ping`
- GET `/api/cart`
- POST `/api/cart` (JSON body: `{ id, name, price, quantity }`)
- DELETE `/api/cart`
