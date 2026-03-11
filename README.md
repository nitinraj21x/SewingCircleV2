# Sewing Circle v3.1

A professional social networking platform with event management, user profiles, and community features.

## 🌟 Features

- 🎯 Event Management System
- 👥 User Registration & Authentication  
- 🔐 Admin Approval Workflow
- 📱 Professional User Profiles
- 💬 Social Feed & Posts
- 🖼️ Image Upload & Management
- 📊 Admin Dashboard
- 🔒 JWT-based Security

## 🛠️ Tech Stack

**Frontend:**
- React 18 + Vite 4
- React Router 6
- Axios
- Lucide React Icons

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (image storage)

## 🚀 Deployment

### Deploy to Render (Recommended)

See **[DEPLOY_TO_RENDER.md](./DEPLOY_TO_RENDER.md)** for complete deployment guide.

**Quick Summary:**
1. Setup MongoDB Atlas (free)
2. Setup Cloudinary (free)
3. Deploy backend to Render
4. Deploy frontend to Render
5. Done! (~20 minutes)

## 💻 Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/nitinraj21x/SewingCircle.git
   cd SewingCircle/AC_SewingCircle/v3.1
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your MongoDB URI and secrets
   
   npm run dev
   ```

3. **Frontend Setup** (new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

### Default Admin Credentials
- Username: `admin`
- Password: `follow.admin`

## 📁 Project Structure

```
AC_SewingCircle/v3.1/
├── backend/              # Express API
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/            # React app
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   └── contexts/    # React contexts
│   ├── index.html
│   └── package.json
└── README.md
```

## 🔑 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/past` - Get past events

### Admin
- `GET /api/admin/users/pending` - Get pending users
- `PUT /api/admin/users/:id/approve` - Approve user
- `GET /api/admin/users` - Get all users

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `PUT /api/posts/:id/like` - Like post

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test
```

## 📖 Documentation

- **[DEPLOY_TO_RENDER.md](./DEPLOY_TO_RENDER.md)** - Complete deployment guide
- **[RENDER_QUICK_SETUP.md](./RENDER_QUICK_SETUP.md)** - Quick deployment reference

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
- Check [DEPLOY_TO_RENDER.md](./DEPLOY_TO_RENDER.md) troubleshooting section
- Open an issue on GitHub
- Contact the development team

## 🎯 Roadmap

- [x] User authentication & authorization
- [x] Event management system
- [x] Admin dashboard
- [x] User profiles
- [x] Social feed
- [ ] Real-time notifications
- [ ] Messaging system
- [ ] Advanced search & filters
- [ ] Mobile app

---

**Version:** 3.1  
**Last Updated:** March 2026  
**Repository:** https://github.com/nitinraj21x/SewingCircle
