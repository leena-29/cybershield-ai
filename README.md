# CyberShield AI 🛡️

> **Production-Grade AI-Powered Cybersecurity Platform**

A comprehensive cybersecurity analysis platform combining advanced password analysis, website scanning, AI phishing detection, domain intelligence, and more.

![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![React](https://img.shields.io/badge/React-18+-blue)

---

## ✨ Features

### 🔐 Password Intelligence
- Shannon entropy calculation
- Dictionary attack detection
- Pattern analysis
- Time-to-crack estimation
- Strength scoring (0-100)
- Real-time suggestions

### 🌐 Website Security
- HTTPS/TLS validation
- SSL certificate analysis
- Security headers (7+)
- XSS detection
- SQL injection detection
- Risk assessment

### 🤖 AI Phishing Detection
- ML-powered detection (Random Forest)
- URL feature extraction
- Confidence scoring
- Real-time analysis

### 📋 Domain Intelligence
- Misspelling detection
- Suspicious keywords
- Age estimation
- Blacklist checking
- Homograph detection

### 🚨 Breach Detection
- Email breach checking
- Password leak detection
- Multi-source checking
- Integration-ready

### 📍 IP Intelligence
- Geolocation
- ISP detection
- Reputation scoring
- Threat detection

### 📧 Email Security
- Spoofing detection
- Phishing analysis
- Authentication checks (SPF, DKIM)
- Content analysis

### 📊 Risk Scoring Engine
- Weighted calculations
- Unified risk scores
- Alert generation
- Smart recommendations

---

## 🏗️ Tech Stack

### Backend
- **Flask** - Web framework
- **MongoDB** - Database
- **PyJWT** - Authentication
- **bcrypt** - Password hashing
- **scikit-learn** - ML models
- **Requests** - HTTP client

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Axios** - API client

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- MongoDB 4.4+

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Configure MongoDB URI in .env
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm start
```

**Backend**: http://localhost:5000
**Frontend**: http://localhost:3000

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

---

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Installation & troubleshooting
- [API Documentation](./API_DOCUMENTATION.md) - All endpoints
- [Project Specifications](./PROJECT_SPECIFICATIONS.md) - Features & architecture

---

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/signup - Register user
POST /api/auth/login - Login user
POST /api/auth/verify-token - Verify JWT
```

### Scanners
```
POST /api/scan/password - Analyze password
POST /api/scan/website - Scan website security
POST /api/scan/phishing - Detect phishing URL
POST /api/scan/domain - Check domain
POST /api/scan/breach - Check breaches
POST /api/scan/ip - Analyze IP
POST /api/scan/email - Analyze email
POST /api/scan/risk-analysis - Unified risk score
```

### History
```
GET /api/history/scans - Get scan history
GET /api/history/alerts - Get alerts
GET /api/history/statistics - Get statistics
DELETE /api/history/delete/:id - Delete scan
```

---

## 📊 Project Structure

```
cybershield-ai/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── database.py
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── ai_models/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── hooks/
│   ├── package.json
│   └── tailwind.config.js
├── SETUP_GUIDE.md
├── API_DOCUMENTATION.md
└── PROJECT_SPECIFICATIONS.md
```

---

## 🎨 UI Features

- 🌙 Dark theme with glassmorphism
- ✨ Smooth animations (Framer Motion)
- 📱 Fully responsive design
- 🎯 Intuitive navigation
- 📊 Data visualization
- 🔔 Real-time alerts
- ♿ Accessibility focused

---

## 🧪 Testing

### Test API with cURL
```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"Pass@123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Pass@123"}'

# Analyze password
curl -X POST http://localhost:5000/api/scan/password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password":"MySecurePass123!"}'
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for more examples.

---

## 🔐 Security Features

✅ Password hashing (bcrypt, 12 rounds)
✅ JWT token authentication
✅ CORS protection
✅ Input validation
✅ SQL injection prevention
✅ XSS awareness
✅ Environment variables for secrets
✅ HTTPS ready

---

## 📈 Performance

- Database indexing on frequently queried fields
- Async/await patterns
- Efficient ML model loading
- Optimized React rendering
- Lazy loading components
- Code splitting ready

---

## 🚀 Deployment

### Deploy Backend (Heroku)
```bash
cd backend
heroku create your-app
heroku addons:create mongolab
git push heroku main
```

### Deploy Frontend (Vercel)
```bash
cd frontend
npm run build
vercel
```

---

## 📝 Default Credentials (for testing)

**Email**: test@example.com
**Password**: TestPass@123

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 🐛 Troubleshooting

**MongoDB Connection Error**: Ensure MongoDB is running
**CORS Errors**: Update CORS_ORIGINS in .env
**Port Already in Use**: Change PORT in configuration

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for more solutions.

---

## 📄 License

MIT License - Free for personal and commercial use.

---

## 👨‍💻 Author

**Leena** - Full Stack Developer

---

## ⭐ Show Your Support

If this project helped you, please give it a ⭐!

---

## 📞 Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

**Made with ❤️ for cybersecurity professionals**
