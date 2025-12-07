const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

// If prisma.config.ts already loaded .env for the CLI, DATABASE_URL
// will be in process.env here.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Start seeding...");

  // Create default settings
  await prisma.settings.upsert({
    where: { key: "vat_percentage" },
    update: {},
    create: {
      key: "vat_percentage",
      value: "5",
      description: "Default VAT percentage",
    },
  });

  await prisma.settings.upsert({
    where: { key: "quotation_prefix" },
    update: {},
    create: {
      key: "quotation_prefix",
      value: "CRY",
      description: "Quotation number prefix",
    },
  });

  await prisma.settings.upsert({
    where: { key: "quotation_terms" },
    update: {},
    create: {
      key: "quotation_terms",
      value: `1. Prices are valid for 30 days from the date of quotation
2. Payment terms: 50% advance, 50% upon completion
3. Delivery: 4-6 weeks from order confirmation
4. Installation to be carried out during normal working hours
5. Any additional civil or structural work not included
6. Prices exclude site mobilization and demobilization
7. All materials are as per approved specifications`,
      description: "Default terms and conditions",
    },
  });

  // Sample customers
  await prisma.customer.createMany({
    data: [
      {
        companyName: "Emirates Development LLC",
        contactPerson: "Ahmed Al Maktoum",
        phone: "+971-4-123-4567",
        email: "ahmed@emiratesdev.ae",
        address: "Business Bay, Dubai, UAE",
      },
      {
        companyName: "Dubai Properties Group",
        contactPerson: "Sara Johnson",
        phone: "+971-4-234-5678",
        email: "sara@dubaiproperties.ae",
        address: "Downtown Dubai, UAE",
      },
    ],
    skipDuplicates: true,
  });

  // Sample items
  await prisma.itemCatalog.createMany({
    data: [
      {
        category: "GLASS",
        name: "12mm Clear Tempered Glass",
        description: "Crystal clear tempered safety glass, 12mm thickness",
        unit: "sqm",
        defaultRate: 280.0,
        isActive: true,
      },
      {
        category: "ALUMINUM",
        name: "Aluminum Profile System",
        description: "Structural aluminum profiles for glass installation",
        unit: "rm",
        defaultRate: 85.0,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
