# Crystalline Quotation System - Quick Start
# Run this script to set up your development environment

Write-Host "🚀 Crystalline Quotation System - Quick Start Setup" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "📦 Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "   Node.js version: $nodeVersion" -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "   ✅ Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env file with your database credentials!" -ForegroundColor Red
    Write-Host "   1. Update DATABASE_URL with your PostgreSQL connection string" -ForegroundColor Yellow
    Write-Host "   2. Generate NEXTAUTH_SECRET by running:" -ForegroundColor Yellow
    Write-Host "      node -e `"console.log(require('crypto').randomBytes(32).toString('base64'))`"" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "Press Enter when you've updated .env file (or 'q' to quit)"
    if ($continue -eq 'q') {
        exit
    }
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Generate Prisma Client
Write-Host ""
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

# Ask about database setup
Write-Host ""
Write-Host "🗄️  Database Setup" -ForegroundColor Yellow
$setupDb = Read-Host "Do you want to set up the database now? (y/n)"

if ($setupDb -eq 'y') {
    Write-Host ""
    Write-Host "🔧 Running database migrations..." -ForegroundColor Yellow
    npx prisma migrate dev --name init
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to run migrations" -ForegroundColor Red
        Write-Host "   Please check your DATABASE_URL in .env" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host ""
    Write-Host "🌱 Seeding database with sample data..." -ForegroundColor Yellow
    npm run seed
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to seed database" -ForegroundColor Red
        exit 1
    }
}

# Success message
Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Start development server: npm run dev" -ForegroundColor White
Write-Host "   2. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Default login credentials:" -ForegroundColor Cyan
Write-Host "   Admin:" -ForegroundColor White
Write-Host "     Email: admin@crystalline.ae" -ForegroundColor Yellow
Write-Host "     Password: admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Estimator:" -ForegroundColor White
Write-Host "     Email: estimator@crystalline.ae" -ForegroundColor Yellow
Write-Host "     Password: estimator123" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Remember to change these passwords in production!" -ForegroundColor Red
Write-Host ""
Write-Host "📖 For deployment instructions, see DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""

$startNow = Read-Host "Start development server now? (y/n)"
if ($startNow -eq 'y') {
    Write-Host ""
    Write-Host "🚀 Starting development server..." -ForegroundColor Green
    Write-Host "   Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
}
