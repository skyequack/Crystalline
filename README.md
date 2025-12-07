# Crystal Line Quotation System

## Overview

This is a professional quotation management system for glass and aluminum contracting. The application is built with Next.js and provides a streamlined interface for managing quotations, customers, and product/service catalogs. This documentation describes the structure and functionality of each page in the system.

---

## Application Structure

- `app/`
  - `layout.tsx` — Root layout and metadata
  - `globals.css` — Global styles (Tailwind CSS)
  - `login/` — Login page
  - `(dashboard)/` — Main dashboard and feature pages
    - `dashboard/` — Dashboard overview
    - `customers/` — Customer management
    - `items/` — Product and service catalog
    - `quotations/` — Quotation management
      - `new/` — Create new quotation
      - `[id]/` — Quotation detail view

---

## Page Documentation

### Login Page (`app/login/page.tsx`)

- **Purpose:** Entry point for users. No authentication is enforced; submitting the form redirects to the dashboard.
- **Fields:**
  - Email address
  - Password
- **Behavior:**
  - On submit, user is redirected to `/dashboard`.

---

### Dashboard (`app/(dashboard)/dashboard/page.tsx`)

- **Purpose:** Provides an overview of system statistics and recent activity.
- **Features:**
  - Displays total quotations, draft quotations, customer count, and active item count.
  - Shows a list of the five most recent quotations, including project name, customer, status, and creation date.
  - Each statistic links to its respective management page.

---

### Customers (`app/(dashboard)/customers/page.tsx`)

- **Purpose:** Manage customer records.
- **Features:**
  - List all customers with company name, contact person, phone, email, and address.
  - Add new customers via a modal form.
- **Form Fields:**
  - Company name (required)
  - Contact person
  - Phone
  - Email
  - Address
- **Behavior:**
  - Submitting the form creates a new customer and refreshes the list.

---

### Items Catalog (`app/(dashboard)/items/page.tsx`)

- **Purpose:** Manage catalog of products and services.
- **Features:**
  - List all items, filterable by category (glass, aluminum, hardware, labor, misc).
  - Add new items via a modal form.
- **Form Fields:**
  - Category (required)
  - Name (required)
  - Description
  - Unit (required)
  - Default rate (required)
- **Behavior:**
  - Submitting the form creates a new item and refreshes the list.

---

### Quotations List (`app/(dashboard)/quotations/page.tsx`)

- **Purpose:** Display all quotations in the system.
- **Features:**
  - Table view with columns for quotation number, project, customer, total, status, created by, and date.
  - Link to create a new quotation.
  - Each quotation links to its detail view.

---

### New Quotation (`app/(dashboard)/quotations/new/page.tsx`)

- **Purpose:** Create a new quotation for a customer project.
- **Features:**
  - Form to select customer, enter project details, and add line items.
  - Line items include scope of work, description, quantity, rate, VAT rate, and subtotal.
  - Subtotals and VAT are calculated automatically.
- **Form Fields:**
  - Customer (required)
  - Project name (required)
  - Site location
  - Notes
  - Items (at least one required)
    - Scope of work (required)
    - Description
    - Quantity (required)
    - Rate (required)
    - VAT rate (calculated)
    - Subtotal (calculated)
- **Behavior:**
  - Submitting the form creates a new quotation and redirects to its detail view.

---

### Quotation Detail (`app/(dashboard)/quotations/[id]/page.tsx`)

- **Purpose:** View, update, download, or delete a specific quotation.
- **Features:**
  - Displays all quotation details, including project, customer, items, totals, notes, and terms.
  - Download the quotation as an Excel file.
  - Change quotation status (Draft, Sent, Revised, Approved, Rejected).
  - Delete the quotation.
- **Behavior:**
  - Status changes are updated via API.
  - Deleting redirects to the quotations list.
  - Download triggers Excel file generation.

---

## API Endpoints

- `/api/quotations` — List and create quotations
- `/api/quotations/[id]` — Get, update, or delete a specific quotation
- `/api/quotations/[id]/download` — Download quotation as Excel
- `/api/customers` — List and create customers
- `/api/items` — List and create items
- `/api/settings` — Retrieve system settings

---

## Styling and Layout

- Uses Tailwind CSS for all styling.
- Layout and navigation are managed via Next.js layouts and pages.
- Metadata is set in `app/layout.tsx`.

---

## Notes

- The system uses an in-memory database for all data storage.
- No authentication is currently enforced.
- All features are accessible from the dashboard after login.

---

For further details on implementation, refer to the source code of each page and API route.
