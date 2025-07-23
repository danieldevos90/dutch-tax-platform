# DutchTax Platform

A comprehensive Dutch tax automation platform with Revolut Business API integration for seamless transaction management and tax calculations.

## 🚀 Features

### Core Platform
- **Dashboard Overview** - Financial insights and key metrics
- **Transaction Management** - Import and categorize transactions
- **Account Management** - Multi-account support with balance tracking
- **Invoice Management** - Create and manage invoices
- **Tax Calculator** - Dutch tax calculations with VAT support
- **Settings Management** - User preferences and integrations

### Revolut Integration
- **Secure OAuth Flow** - Industry-standard authentication
- **Per-User Certificates** - Individual RSA key pairs for each user
- **Automatic Token Refresh** - Seamless API access management
- **Account Syncing** - Real-time account and transaction data
- **Multi-Environment Support** - Sandbox and production ready

## 🛠 Tech Stack

- **Frontend**: Next.js 13+ with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Banking API**: Revolut Business API
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Revolut Business account (for API access)
- Supabase account (for authentication and database)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/dutch-tax-platform.git
cd dutch-tax-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Revolut API Configuration (Optional - for production)
REVOLUT_SANDBOX_MODE=true
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Revolut Integration Setup

### For Development (Sandbox)

1. **Sign up for Revolut Business Sandbox**
   - Visit [Revolut Developer Portal](https://developer.revolut.com)
   - Request sandbox access
   - Create a sandbox business account

2. **Configure OAuth Redirect**
   - Set redirect URI to: `http://localhost:3000/api/revolut/callback`
   - Note your Client ID for later use

### For Production

1. **Generate Production Certificates**
   ```bash
   cd revolut-certs
   openssl genrsa -out privatecert.pem 2048
   openssl req -new -x509 -key privatecert.pem -out publiccert.cer -days 1825
   ```

2. **Upload to Revolut Business**
   - Go to Revolut Business web app
   - Navigate to Settings → APIs → Business API
   - Upload your public certificate
   - Set redirect URI to your production domain

## 📁 Project Structure

```
dutch-tax-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   └── revolut/       # Revolut integration APIs
│   │   ├── dashboard/         # Dashboard pages
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── auth/             # Authentication components
│   │   └── dashboard/        # Dashboard components
│   └── lib/                  # Utility libraries
│       └── revolut-integration.ts  # Revolut API client
├── revolut-certs/            # Certificate storage (gitignored)
├── public/                   # Static assets
└── package.json
```

## 🔐 Security Features

- **OAuth 2.0 Compliance** - Secure authentication flow
- **RSA Key Pairs** - Individual certificates per user
- **Token Management** - Automatic refresh and secure storage
- **Environment Isolation** - Separate sandbox/production configs
- **Input Validation** - Comprehensive data validation

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Push code to GitHub
   - Connect repository to Vercel
   - Configure environment variables

2. **Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   REVOLUT_SANDBOX_MODE=false
   ```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📊 API Documentation

### Revolut Integration Endpoints

- `POST /api/revolut/connect` - Initialize connection
- `POST /api/revolut/authorize` - Create OAuth URL
- `GET /api/revolut/callback` - Handle OAuth callback
- `POST /api/revolut/sync` - Sync accounts and transactions
- `GET /api/revolut/sync` - Get connection status

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/yourusername/dutch-tax-platform/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/dutch-tax-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/dutch-tax-platform/discussions)

## 🙏 Acknowledgments

- [Revolut Business API](https://developer.revolut.com) for banking integration
- [Supabase](https://supabase.com) for authentication and database
- [Next.js](https://nextjs.org) for the React framework
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Lucide](https://lucide.dev) for icons

---

Built with ❤️ for Dutch entrepreneurs and businesses.
