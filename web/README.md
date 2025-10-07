# Life Simulator Finance

A comprehensive financial planning and simulation application built with Next.js, NextAuth.js, and SQLite.

## Features

- **User Authentication**: Secure login/signup with NextAuth.js
- **Financial Plan Management**: Create, save, and manage multiple financial plans
- **Simulation Engine**: Run financial simulations with realistic market conditions
- **Investment Strategies**: Choose from conservative to aggressive investment approaches
- **Asset Management**: Track houses, cars, rental properties, and investments
- **Game Mode**: Gamified experience with achievements and progress tracking
- **Data Persistence**: All data stored securely in SQLite database

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with credentials provider
- **Database**: SQLite with Prisma ORM
- **Charts**: Chart.js with react-chartjs-2
- **Optimization**: GLPK-WASM for linear programming

## Setup Instructions

### 1. Install Dependencies

```bash
cd web
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the `web` directory:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# Database
DATABASE_URL="file:./dev.db"
```

**Important**: Replace `your-secret-key-here-change-in-production` with a secure random string for production.

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Create and migrate database
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

### Getting Started

1. **Sign Up**: Create a new account or sign in with existing credentials
2. **Create Plan**: Set up your first financial plan with starting parameters
3. **Simulate**: Run year-by-year simulations to see how your finances evolve
4. **Track Progress**: Monitor your savings, investments, and achievements

### Financial Planning

- **Starting Parameters**: Set your initial salary, age, and growth expectations
- **Investment Strategy**: Choose from conservative, moderate, aggressive, or entrepreneur strategies
- **Asset Purchases**: Buy houses, cars, and rental properties as your wealth grows
- **Risk Management**: Understand how market volatility affects your portfolio

### Game Mode

Switch to Game Mode for a more engaging experience:
- Earn achievements for major milestones
- Visual progress indicators
- Gamified interface with rewards

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Financial Plans
- `GET /api/financial-plans` - List user's financial plans
- `POST /api/financial-plans` - Create new financial plan
- `GET /api/financial-plans/[id]` - Get specific financial plan
- `PUT /api/financial-plans/[id]` - Update financial plan
- `DELETE /api/financial-plans/[id]` - Delete financial plan
- `POST /api/financial-plans/[id]/simulation` - Save simulation history

## Database Schema

### Users
- User accounts with authentication
- Profile information and preferences

### Financial Plans
- Complete financial simulation state
- Investment strategies and asset holdings
- Game mode achievements

### Simulation History
- Year-by-year simulation snapshots
- Investment returns and market conditions
- Progress tracking over time

## Development

### Project Structure

```
web/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   └── simulator/      # Simulation pages
│   ├── components/         # React components
│   └── lib/                # Utilities and configurations
├── prisma/                 # Database schema and migrations
└── public/                 # Static assets
```

### Key Components

- **FinancialPlanManager**: Main dashboard for managing plans
- **AuthComponents**: Login/signup forms and authentication UI
- **SimulatorTab**: Core simulation interface
- **FinancialStatusTab**: Financial overview and metrics
- **PurchasesTab**: Asset purchase interface
- **InvestmentsTab**: Investment strategy management
- **OptimizationTab**: Budget optimization tools

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on GitHub or contact the development team.