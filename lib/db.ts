// Simple in-memory data store (temporary replacement for database)

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ESTIMATOR";
}

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface ItemCatalog {
  id: string;
  category: "GLASS" | "ALUMINUM" | "HARDWARE" | "LABOR" | "MISC";
  name: string;
  description: string | null;
  unit: string;
  defaultRate: number;
  isActive: boolean;
}

export interface QuotationItem {
  id: string;
  quotationId: string;
  scopeOfWork: string;
  description: string | null;
  quantity: number;
  rate: number;
  vatRate: number;
  subTotal: number;
  sortOrder: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  projectName: string;
  siteLocation: string | null;
  status: "DRAFT" | "SENT" | "REVISED" | "APPROVED" | "REJECTED";
  subtotal: number;
  vatPercentage: number;
  vatAmount: number;
  total: number;
  notes: string | null;
  terms: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  key: string;
  value: string;
  description: string | null;
}

// In-memory storage
let users: User[] = [
  {
    id: "1",
    name: "System User",
    email: "admin@crystalline.ae",
    role: "ADMIN",
  },
];

let customers: Customer[] = [
  {
    id: "1",
    companyName: "Emirates Development LLC",
    contactPerson: "Ahmed Al Maktoum",
    phone: "+971-4-123-4567",
    email: "ahmed@emiratesdev.ae",
    address: "Business Bay, Dubai, UAE",
  },
  {
    id: "2",
    companyName: "Dubai Properties Group",
    contactPerson: "Sara Johnson",
    phone: "+971-4-234-5678",
    email: "sara@dubaiproperties.ae",
    address: "Downtown Dubai, UAE",
  },
];

let items: ItemCatalog[] = [
  {
    id: "1",
    category: "GLASS",
    name: "12mm Clear Tempered Glass",
    description: "Crystal clear tempered safety glass, 12mm thickness",
    unit: "sqm",
    defaultRate: 280.0,
    isActive: true,
  },
  {
    id: "2",
    category: "ALUMINUM",
    name: "Aluminum Profile System",
    description: "Structural aluminum profiles for glass installation",
    unit: "rm",
    defaultRate: 85.0,
    isActive: true,
  },
];

let quotations: Quotation[] = [];
let quotationItems: QuotationItem[] = [];

let settings: Settings[] = [
  { key: "vat_percentage", value: "5", description: "Default VAT percentage" },
  {
    key: "quotation_prefix",
    value: "CRY",
    description: "Quotation number prefix",
  },
  {
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
];

// Helper functions
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Export store methods
type QuotationInclude = {
  customer?: boolean;
  createdBy?: boolean;
  items?: boolean;
};

type QuotationOrderBy = Partial<Record<keyof Quotation, "asc" | "desc">>;

type QuotationFindManyOptions = {
  where?: { status?: Quotation["status"]; customerId?: string };
  include?: QuotationInclude;
  orderBy?: QuotationOrderBy;
};

type QuotationSelect = Partial<Record<keyof Quotation, boolean>>;

export const db = {
  user: {
    findFirst: () => users[0],
  },
  customer: {
    findMany: () => customers,
    findUnique: (id: string) => customers.find((c) => c.id === id),
    create: (data: Omit<Customer, "id">) => {
      const customer = { ...data, id: generateId() };
      customers.push(customer);
      return customer;
    },
    count: () => customers.length,
  },
  itemCatalog: {
    findMany: (filter?: { category?: string; isActive?: boolean }) => {
      let result = items;
      if (filter?.category) {
        result = result.filter((i) => i.category === filter.category);
      }
      if (filter?.isActive !== undefined) {
        result = result.filter((i) => i.isActive === filter.isActive);
      }
      return result;
    },
    create: (data: Omit<ItemCatalog, "id">) => {
      const item = { ...data, id: generateId() };
      items.push(item);
      return item;
    },
    count: (filter?: { isActive?: boolean }) => {
      if (filter?.isActive !== undefined) {
        return items.filter((i) => i.isActive === filter.isActive).length;
      }
      return items.length;
    },
  },
  quotation: {
    findMany: (options?: QuotationFindManyOptions) => {
      let result = quotations;
      if (options?.where?.status) {
        result = result.filter((q) => q.status === options?.where?.status);
      }
      if (options?.where?.customerId) {
        result = result.filter(
          (q) => q.customerId === options?.where?.customerId
        );
      }
      if (options?.include) {
        return result.map((q) => ({
          ...q,
          customer: customers.find((c) => c.id === q.customerId),
          createdBy: users[0],
          items: quotationItems.filter((i) => i.quotationId === q.id),
        }));
      }
      return result;
    },
    findUnique: (idOrNumber: string, options?: { include?: QuotationInclude }) => {
      // Allow lookup by internal id or human-friendly quotation number
      const quotation = quotations.find(
        (q) => q.id === idOrNumber || q.quotationNumber === idOrNumber
      );
      if (!quotation) return null;
      if (options?.include) {
        return {
          ...quotation,
          customer: customers.find((c) => c.id === quotation.customerId),
          createdBy: users[0],
          items: quotationItems
            .filter((i) => i.quotationId === quotation.id)
            .sort((a, b) => a.sortOrder - b.sortOrder),
        };
      }
      return quotation;
    },
    findFirst: (options?: { orderBy?: QuotationOrderBy; select?: QuotationSelect }) => {
      if (quotations.length === 0) return null;
      return quotations[quotations.length - 1];
    },
    create: (data: {
      data: Omit<Quotation, "id" | "createdAt" | "updatedAt"> & {
        items?: { create: Omit<QuotationItem, "id" | "quotationId">[] };
      };
      include?: QuotationInclude;
    }) => {
      const { items: itemsData, ...quotationData } = data.data;
      const quotation: Quotation = {
        ...quotationData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      quotations.push(quotation);

      if (itemsData?.create) {
        itemsData.create.forEach((itemData, index) => {
          const item: QuotationItem = {
            ...itemData,
            id: generateId(),
            quotationId: quotation.id,
          };
          quotationItems.push(item);
        });
      }

      if (data.include) {
        return {
          ...quotation,
          customer: customers.find((c) => c.id === quotation.customerId),
          createdBy: users[0],
          items: quotationItems.filter((i) => i.quotationId === quotation.id),
        };
      }
      return quotation;
    },
    update: (
      id: string,
      data: {
        data: Partial<Quotation> & {
          items?: { create: Omit<QuotationItem, "id" | "quotationId">[] };
        };
        include?: QuotationInclude;
      }
    ) => {
      const index = quotations.findIndex((q) => q.id === id);
      if (index === -1) throw new Error("Quotation not found");

      const { items: itemsData, ...updateData } = data.data;
      quotations[index] = {
        ...quotations[index],
        ...updateData,
        updatedAt: new Date(),
      };

      if (itemsData?.create) {
        itemsData.create.forEach((itemData) => {
          const item: QuotationItem = {
            ...itemData,
            id: generateId(),
            quotationId: id,
          };
          quotationItems.push(item);
        });
      }

      if (data.include) {
        return {
          ...quotations[index],
          customer: customers.find(
            (c) => c.id === quotations[index].customerId
          ),
          createdBy: users[0],
          items: quotationItems
            .filter((i) => i.quotationId === id)
            .sort((a, b) => a.sortOrder - b.sortOrder),
        };
      }
      return quotations[index];
    },
    delete: (id: string) => {
      quotations = quotations.filter((q) => q.id !== id);
      quotationItems = quotationItems.filter((i) => i.quotationId !== id);
      return {};
    },
    count: (filter?: { where?: { status?: string } }) => {
      if (filter?.where?.status) {
        return quotations.filter((q) => q.status === filter?.where?.status)
          .length;
      }
      return quotations.length;
    },
  },
  quotationItem: {
    deleteMany: (filter: { where: { quotationId: string } }) => {
      quotationItems = quotationItems.filter(
        (i) => i.quotationId !== filter.where.quotationId
      );
      return {};
    },
  },
  settings: {
    findMany: () => settings,
    findUnique: (key: string) => settings.find((s) => s.key === key) || null,
    upsert: (options: {
      where: { key: string };
      update: { value: string };
      create: { key: string; value: string; description?: string };
    }) => {
      const index = settings.findIndex((s) => s.key === options.where.key);
      if (index !== -1) {
        settings[index].value = options.update.value;
        return settings[index];
      } else {
        const newSetting = {
          key: options.create.key,
          value: options.create.value,
          description: options.create.description || null,
        };
        settings.push(newSetting);
        return newSetting;
      }
    },
  },
};
