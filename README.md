# Seisuvai Catering Service POS & Billing System (SBBMS)

Welcome to the Seisuvai Catering Service POS & Billing System (SBBMS) repository. This project is a tailored back-office billing and POS management system designed for South Indian premium catering services.

## 📄 Professional Word Document Documentation

As requested, we have generated a highly professional, interactive, and beautifully styled Word Document (`README.docx`) at the root of the workspace.

👉 **[Download / Open README.docx](file:///C:/Projects/Personal%20projects/billing/README.docx)**

The Word document includes:
- **Interactive Navigation**: Integrated Table of Contents and internal bookmarks to easily jump between sections.
- **Tech Stack Details**: A clean tabular breakdown of frontend, backend, and database technologies.
- **Design Tokens and Colors**: Color palette mapping derived from actual Seisuvai invoice/quotation PDFs (`bills.service.ts`).
- **Responsive Checklist**: Checklist elements for mobile-first responsiveness design audits.
- **Troubleshooting Guide**: Solutions to common developer startup issues.

To regenerate this document dynamically at any time:
```bash
node scripts/create_readme.js
```

---

## 🚀 Quick Start Instructions

### 1. Backend Server Setup
```bash
cd project/backend
npm install
npm run build      # Disables incremental compiler conflicts
npm run start      # Runs NestJS server on port 3001
```

### 2. Frontend App Setup
```bash
cd project/frontend
npm install
npm run dev        # Runs Next.js app on http://localhost:3000
```

---

## 🛠 Tech Stack Summary

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4, Zustand (state management), TanStack Query (data fetching).
- **Backend**: NestJS framework, Prisma ORM, SQLite.
- **Key Modules**: `@nestjs/passport` + `@nestjs/jwt` (auth), `pdfkit` (invoice/quotation PDF generation).
