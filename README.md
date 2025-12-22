# ProjectHub - Full-Stack Project Marketplace Platform

A modern, secure platform for discovering, sharing, and monetizing software projects. Built with MERN stack (MongoDB, Express, React, Node.js) with admin verification workflow and integrated payments.

## 🎯 Features

### For Users
- Browse and search projects with advanced filters
- Download free projects instantly
- Purchase premium projects securely (₹49, ₹99, ₹299)
- Rate, review, and favorite projects
- Personal dashboard with purchase history

### For Creators
- Upload projects via ZIP file or GitHub link
- Manage uploaded projects
- Track earnings and sales analytics
- Automatic commission distribution (85% creator, 15% platform)
- Creator dashboard with detailed statistics

### For Admins
- Review and approve/reject pending projects
- Test projects before making them public
- Manage users and roles
- View platform analytics and revenue
- Upload verified official projects

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt.js** - Password hashing
- **Cloudinary** - File storage
- **Razorpay** - Payment integration
- **Multer** - File uploads

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Cloudinary account
- Razorpay account (for payments)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/projecthub
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
ADMIN_COMMISSION=15
FRONTEND_URL=http://localhost:5173
```

4. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🚀 Usage

### Creating an Admin User

Since there's no admin registration endpoint, you need to create an admin user directly in MongoDB:

1. Register a regular user through the app
2. Open MongoDB and find that user in the `users` collection
3. Update the user's `role` field to `"admin"`

### User Roles

- **User**: Browse, download, and purchase projects
- **Creator**: Upload projects, earn money from sales
- **Admin**: Approve/reject projects, manage platform

### Project Upload Flow

1. Creator uploads project (ZIP or GitHub link)
2. Project status: **Pending**
3. Admin reviews and tests the project
4. Admin approves → **Approved** (publicly visible)
5. Admin rejects → **Rejected** (creator notified with reason)

### Payment Flow

1. User selects a paid project
2. Razorpay payment gateway opens
3. Payment verification happens
4. On success:
   - Transaction recorded
   - Creator wallet credited (85%)
   - Project added to user's purchases
   - Download link provided

## 📁 Project Structure

```
ProjectHUB/
├── backend/
│   ├── config/          # Database & Cloudinary config
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth, error handling, upload
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   ├── server.js        # Main server file
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Route pages
    │   ├── store/       # Zustand state management
    │   ├── lib/         # Utils and API client
    │   ├── App.jsx      # Main app component
    │   └── main.jsx     # Entry point
    └── package.json
```

## 🎨 UI Features

- **Dual Theme**: Light & Dark mode with smooth transitions
- **Responsive Design**: Mobile-first, works on all devices
- **Modern UI**: Clean, professional design with Tailwind CSS
- **Smooth Animations**: Framer Motion for page transitions
- **Toast Notifications**: Real-time feedback for user actions

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Admin verification for all projects
- Secure payment verification
- Rate limiting on API endpoints
- Input validation and sanitization

## 📊 Database Schemas

### User
- Username, email, password (hashed)
- Role (user/creator/admin)
- Wallet balance
- Favorites & purchased projects

### Project
- Title, description, tech stack
- Difficulty, category, tags
- Price tier (Free/₹49/₹99/₹299)
- Upload mode (ZIP/GitHub)
- Status (pending/approved/rejected)
- Admin verification badge
- Stats (downloads, views, rating, sales)

### Transaction
- User, project, creator references
- Amount, commission, earnings split
- Payment details (Razorpay)
- Status tracking

### Review
- User, project references
- Rating (1-5 stars)
- Comment
- One review per user per project

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Projects
- `GET /api/projects` - Get all projects (with filters)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (Creator/Admin)
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/upload` - Upload file to Cloudinary
- `GET /api/projects/creator/my-projects` - Get creator's projects

### Admin
- `GET /api/admin/projects/pending` - Get pending projects
- `PUT /api/admin/projects/:id/approve` - Approve project
- `PUT /api/admin/projects/:id/reject` - Reject project
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get platform statistics

### Payments
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/purchases` - Get purchase history
- `POST /api/payment/download-free/:id` - Download free project
- `GET /api/payment/earnings` - Get creator earnings

### Reviews
- `POST /api/reviews/:projectId` - Add/update review
- `GET /api/reviews/:projectId` - Get project reviews
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/favorite/:projectId` - Toggle favorite
- `GET /api/reviews/favorites/my` - Get user favorites

## 🎯 Pricing Tiers

| Tier | Description | Price | Creator Gets |
|------|-------------|-------|--------------|
| Free | Free projects | ₹0 | N/A |
| Mini | Small projects | ₹49 | ₹41.65 |
| Medium | Medium projects | ₹99 | ₹84.15 |
| Full Stack | Large projects | ₹299 | ₹254.15 |

*15% platform commission on all sales*

## 🔧 Environment Variables

### Backend Required
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `CLOUDINARY_*` - Cloudinary credentials
- `RAZORPAY_*` - Razorpay credentials

### Frontend Required
- `VITE_API_URL` - Backend API URL
- `VITE_RAZORPAY_KEY_ID` - Razorpay public key

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Developer

Built with ❤️ using modern web technologies.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Note**: Remember to update all environment variables with your actual credentials before deployment!
