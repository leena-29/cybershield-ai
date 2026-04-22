# CyberShield AI - Complete Setup Guide

## 📋 Prerequisites

- Python 3.8+
- Node.js 14+
- MongoDB 4.4+
- npm or yarn

## 🚀 Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set:
- `MONGO_URI`: Your MongoDB connection string
- `SECRET_KEY`: Strong random string
- `JWT_SECRET_KEY`: Another strong random string

### 3. Ensure MongoDB is Running

```bash
# On Windows
mongod

# On macOS
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

### 4. Run Backend Server

```bash
python app.py
```

Server will start at `http://localhost:5000`

### 5. Test API Health

```bash
curl http://localhost:5000/api/health
```

---

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

### 3. Start Development Server

```bash
npm start
```

Application will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

---

## 🧪 Testing the APIs

### 1. User Signup

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass@123"
  }'
```

### 2. User Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass@123"
  }'
```

### 3. Analyze Password (requires token)

```bash
curl -X POST http://localhost:5000/api/scan/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "password": "MySecurePassword123!"
  }'
```

### 4. Scan Website

```bash
curl -X POST http://localhost:5000/api/scan/website \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "https://example.com"
  }'
```

### 5. Detect Phishing

```bash
curl -X POST http://localhost:5000/api/scan/phishing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "http://g00gle-verify.xyz"
  }'
```

---

## 📊 Database Collections

### Users Collection
```json
{
  "_id": ObjectId,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "created_at": ISODate(),
  "updated_at": ISODate()
}
```

### Scans Collection
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "scan_type": "password",
  "target": "***",
  "result": {...},
  "status": "completed",
  "created_at": ISODate(),
  "updated_at": ISODate()
}
```

---

## 🛠️ Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGO_URI in .env
- Try: `mongosh`

### CORS Errors
- Update CORS_ORIGINS in backend .env
- Ensure frontend URL matches

### Token Errors
- Check JWT_SECRET_KEY is set correctly
- Verify Authorization header format: `Bearer TOKEN`

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Project Structure

```
cybershield-ai/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── database.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── scanner.py
│   │   └── history.py
│   ├── services/
│   │   ├── password_analyzer.py
│   │   ├── website_scanner.py
│   │   ├── phishing_detector.py
│   │   ├── domain_intelligence.py
│   │   ├── breach_detector.py
│   │   ├── ip_analyzer.py
│   │   ├── email_analyzer.py
│   │   └── risk_scorer.py
│   ├── utils/
│   │   └── auth.py
│   ├── ai_models/
│   │   └── phishing_detector.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.js
│   │   │   ├── Button.js
│   │   │   ├── InputField.js
│   │   │   ├── RiskBadge.js
│   │   │   └── ResultCard.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   └── PasswordAnalyzer.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── hooks/
│   │   │   └── useFormHandle.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.local
```

---

## 🚢 Deployment

### Backend (Heroku)
```bash
cd backend
heroku create your-app-name
heroku addons:create mongolab:sandbox
git push heroku main
```

### Frontend (Vercel)
```bash
cd frontend
npm install -g vercel
vercel
```

---

## 🔐 Security Checklist

- [ ] Change SECRET_KEY and JWT_SECRET_KEY in production
- [ ] Set DEBUG=False in production
- [ ] Use HTTPS for all connections
- [ ] Set secure CORS origins
- [ ] Install MongoDB with authentication
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB encryption
- [ ] Add rate limiting to APIs
- [ ] Implement request validation
- [ ] Add logging and monitoring

---

## 📝 License

MIT License

## 👨‍💻 Support

For issues or questions, please create an issue in the repository.
