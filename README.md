# Crystalline - Glass & Aluminum Quotation System

A professional, web-based quotation management system specifically designed for Glass & Aluminum contracting companies in the UAE.

## 🎯 Features

- ✅ **Complete Quotation Management** - Create, edit, and track project quotations
- ✅ **ExcelJS-Based Excel Generation** - Download professionally formatted quotation Excel files
- ✅ **Customer Management** - Maintain a comprehensive customer database
- ✅ **Items Catalog** - Pre-configured glass & aluminum products and services
- ✅ **Scope of Work Templates** - 13+ pre-built templates for common installations
- ✅ **Role-Based Access** - Admin and Estimator roles with appropriate permissions
- ✅ **Automatic Calculations** - Real-time subtotals, VAT, and grand totals
- ✅ **Status Tracking** - Draft, Sent, Revised, Approved, Rejected
- ✅ **Professional UI** - Clean, responsive design optimized for desktop and mobile

## 🏗️ Technology Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js (Email + Password)
- **Excel Generation:** ExcelJS
- **Deployment:** Vercel (recommended) or any Node.js hosting

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository

\`\`\`powershell
cd "C:\\Users\\omerm\\Crystalline"
\`\`\`

### 2. Install Dependencies

\`\`\`powershell
npm install
\`\`\`

### 3. Configure Environment Variables

Create a \`.env\` file in the root directory:

\`\`\`env

# Database

DATABASE_URL="postgresql://username:password@localhost:5432/crystalline"

# NextAuth

NEXTAUTH_SECRET="generate-a-random-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Company Info

NEXT_PUBLIC_COMPANY_NAME="Crystalline Glass & Aluminum"
NEXT_PUBLIC_COMPANY_PHONE="+971-XX-XXXXXXX"
NEXT_PUBLIC_COMPANY_EMAIL="info@crystalline.ae"
NEXT_PUBLIC_COMPANY_ADDRESS="Dubai, UAE"
\`\`\`

**To generate NEXTAUTH_SECRET:**
\`\`\`powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
\`\`\`

### 4. Set Up Database

\`\`\`powershell

# Generate Prisma Client

npx prisma generate

# Run migrations

npx prisma migrate dev --name init

# Seed the database with sample data

npm run seed
\`\`\`

### 5. Run Development Server

\`\`\`powershell
npm run dev
\`\`\`

Visit **http://localhost:3000**

## 👤 Default Login Credentials

After seeding, use these credentials:

**Admin Account:**

- Email: `admin@crystalline.ae`
- Password: `admin123`

**Estimator Account:**

- Email: `estimator@crystalline.ae`
- Password: `estimator123`

⚠️ **IMPORTANT:** Change these passwords immediately in production!

## 📦 Database Schema

The system includes these main models:

- **User** - System users with role-based access
- **Customer** - Customer contact information
- **ItemCatalog** - Pre-configured items (glass, aluminum, hardware, labor)
- **Quotation** - Main quotation entity
- **QuotationItem** - Line items within quotations
- **Settings** - System configuration (VAT %, terms, etc.)

## 🎨 Key Features Explained

### Excel Generation

The system uses **ExcelJS** to generate professional Excel quotations with:

- Company branding and header
- Customer and project details
- Detailed line items table with columns: Scope of Work, Quantity, Rate, VAT Rate, Sub-Total
- Automatic calculations
- Professional formatting (colors, borders, fonts)
- Terms & conditions section
- Signature fields

### Scope of Work Templates

13 pre-configured templates for common installations:

- Glass Wall Systems
- Decorative Glass Panels
- Aluminum Cladding
- Windows & Doors
- Frameless Doors
- Glass Railings
- Curtain Walls
- Skylights
- Shower Enclosures
- Mirrors
- Aluminum Louvers
- Office Partitions
- Entrance Canopies

### Column Structure

Each quotation line item includes:

1. **Scope of Work** - Project location and work description
2. **Quantity** - Amount of work
3. **Rate** - Unit price in AED
4. **VAT Rate** - Calculated VAT amount per line
5. **Sub-Total** - Total for that line item

## 🔐 Security Features

- ✅ Secure password hashing with bcrypt
- ✅ JWT-based session management
- ✅ Role-based access control (RBAC)
- ✅ Protected API routes
- ✅ Input validation with Zod
- ✅ SQL injection protection via Prisma

## 📱 User Interface

### Dashboard

- Overview statistics
- Recent quotations
- Quick access to all modules

### Quotations

- List view with filtering
- Create new quotations with templates
- View/edit existing quotations
- Download Excel files
- Status management

### Customers

- Customer directory
- Add new customers
- Contact information management

### Items Catalog

- Browse items by category
- Add custom items
- Default rates and units

## 🌐 Deployment

### Vercel (Recommended)

1. **Push to GitHub:**
   \`\`\`powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/crystalline.git
   git push -u origin main
   \`\`\`

2. **Deploy to Vercel:**

   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Set Up Production Database:**

   - Use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)
   - Copy the PostgreSQL connection string
   - Add to Vercel environment variables as `DATABASE_URL`

4. **Run Migrations:**
   \`\`\`powershell

# In Vercel, migrations run automatically via postinstall script

# Or manually via Vercel CLI:

vercel env pull .env.local
npx prisma migrate deploy
npm run seed
\`\`\`

### Alternative: Docker Deployment

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package\*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
\`\`\`

## 🛠️ Development Commands

\`\`\`powershell

# Development server

npm run dev

# Build for production

npm run build

# Start production server

npm start

# Prisma Studio (Database GUI)

npm run prisma:studio

# Run migrations

npm run prisma:migrate

# Seed database

npm run seed

# Lint code

npm run lint
\`\`\`

## 📊 Database Management

**View Database:**
\`\`\`powershell
npx prisma studio
\`\`\`
Opens at http://localhost:5555

**Reset Database (Development Only):**
\`\`\`powershell
npx prisma migrate reset
\`\`\`

**Generate Prisma Client after schema changes:**
\`\`\`powershell
npx prisma generate
\`\`\`

## 🎯 Customization

### Adding New Scope Templates

Edit `data/scope-templates.json`:

\`\`\`json
{
"id": "unique-id",
"category": "Category Name",
"title": "Template Title",
"template": "Description with {placeholders}",
"defaultValues": {
"placeholder": "default value"
}
}
\`\`\`

### Changing VAT Percentage

Admin users can change VAT % in Settings page or directly in database:

\`\`\`sql
UPDATE settings SET value = '5' WHERE key = 'vat_percentage';
\`\`\`

### Customizing Excel Format

Edit `lib/excel-generator.ts` to modify:

- Column widths
- Colors and styling
- Header/footer content
- Font sizes

### Adding Company Logo

Update `lib/excel-generator.ts` to include logo image:

\`\`\`typescript
const logo = workbook.addImage({
filename: 'path/to/logo.png',
extension: 'png',
});

worksheet.addImage(logo, 'A1:B3');
\`\`\`

## 🐛 Troubleshooting

**Database Connection Issues:**

- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

**Build Errors:**

- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall
- Check Node.js version (18+)

**Authentication Issues:**

- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies

**Excel Download Not Working:**

- Check browser console for errors
- Verify ExcelJS is installed: `npm list exceljs`
- Ensure quotation has items

## 📞 Support

For issues or questions:

1. Check this README
2. Review the code comments
3. Check Prisma schema for data structure
4. Review API routes in `app/api/`

## 📄 License

Proprietary - Internal Business Tool

## 🎉 Credits

Built with:

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [ExcelJS](https://github.com/exceljs/exceljs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Version:** 1.0.0  
**Last Updated:** December 2025
