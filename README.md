# FLUXA

FLUXA is an enterprise multi-tenant print management SaaS platform.

## Phase 1 Foundation

This phase established the production-oriented Next.js application foundation, TypeScript configuration, Tailwind setup, global layout shell, reusable UI primitives, reusable layouts, navigation components, and animation utilities.

Business features, authentication, database access, APIs, uploads, OTP, analytics, payments, and print queue logic are intentionally deferred to later phases.

## Phase 2 Design System Foundation

This phase strengthens the shared FLUXA visual language with reusable design tokens, semantic status tones, surface variants, refined UI primitives, brand components, and design-system documentation.

All future portals should inherit these primitives rather than creating page-specific styling.

## Phase 3 Database Foundation

This phase introduces the Prisma/PostgreSQL schema foundation for organizations, users, memberships, RBAC, feature modules, sessions, refresh tokens, platform settings, and audit logs.

Domain-specific print workflows remain deferred until the database foundation is approved.

## Phase 4 Authentication and Tenant Foundation

This phase introduces the first runtime server foundation for authentication, protected routing, Prisma access, tenant context helpers, RBAC permission helpers, and audit logging. Print-domain workflows remain deferred until the protected application shell is stable.

## Phase 5 Multi-Tenant Organization Management Foundation

This phase introduces tenant-aware organization onboarding, organization CRUD services, organization settings, active organization switching, organization dashboard surfaces, and centralized tenant isolation helpers.

## Phase 6 Organization Members, Invitations, and RBAC Administration

This phase adds tenant-scoped member administration, invitation lifecycle management, role and permission administration, reusable authorization guards, member profile management, and organization audit-log review. Print-domain workflows remain deferred until RBAC-governed organization administration is approved.

## Phase 7 Customer Portal Foundation and Print Job Lifecycle

This phase adds the customer portal foundation, customer dashboard/profile/settings/onboarding surfaces, customer print history and job details, upload workflow placeholders, customer notifications/activity, and tenant-scoped print job lifecycle models and services. Physical printer assignment, storage providers, payment capture, and production print processing remain deferred.

## Phase 8 Employee Portal, Print Queue, and Print Operations

This phase adds the employee portal foundation, tenant-aware print queue management, assigned jobs, queue/customer lookup, job operation actions, printer availability foundations, printer assignment, and employee profile/settings surfaces. Advanced production spooler integrations and hardware telemetry remain deferred.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — build the production app
- `npm run lint` — run ESLint
- `npm run typecheck` — run TypeScript checks
- `npm run format` — verify Prettier formatting

## Phase 9 OTP and Print Collection

This phase adds secure print collection OTP generation, hashed OTP history, employee verification, customer collection notifications, audit events, and final print-job completion flow.

## Phase 10 Analytics, Reports, and Notification Center

This phase adds tenant and platform analytics, report filtering/export foundations, in-app notification center, notification badge counts, and report/audit service foundations.

## Phase 11 Master Developer Portal and Global Platform Administration

This phase adds the hidden Master Developer Portal with strict platform authorization, developer-only login entry, global organization/user/customer/employee administration, organization impersonation and suspension controls, feature flag/module review, subscription and API key foundations, global settings, platform analytics, audit logs, error monitoring, storage management, system health, background job monitoring, announcements, and global search.

## Phase 12 Cinematic Landing Page, Upload Platform, and WhatsApp Foundation

This phase introduces the cinematic public website, premium animated landing experience, flagship customer upload workspace, print configuration and estimated-cost foundation, and provider-agnostic WhatsApp Business intake architecture for organization-specific media-to-print workflows.

## Phase 13A AI Core Platform and Provider Architecture

This phase introduces the provider-independent AI core foundation for future FLUXA AI capabilities, including provider and model registries, tenant AI configuration, prompt template storage, AI request/response logging, usage statistics, provider health monitoring, retry/timeout/rate-limit policy foundations, API endpoints, organization AI settings, Master Developer AI management, audit logging, and feature-flag integration. OCR, AI chat, AI print assistant, billing, and automation workflows remain deferred to later phases.

## Phase 13B OCR Engine and Document Intelligence Platform

This phase extends the Phase 13A AI core with tenant-isolated OCR job management, OCR queue/status/history foundations, secure OCR APIs, document analysis reports, preview metadata, OCR analytics, recoverable error handling, organization OCR management, and Master Developer OCR diagnostics. AI chat, AI print assistant, billing, and automation engine workflows remain deferred to later phases.

## Phase 13C AI Print Assistant, Automation, Analytics, and Search

This phase transforms FLUXA into an intelligent print-management platform by extending Phase 13A AI Core and Phase 13B OCR foundations with explainable AI print recommendations, reusable automation rules and executions, intelligent enterprise search, saved-search/history foundations, AI analytics snapshots, organization intelligence widgets, and a Master Developer AI Operations Center. Billing, payments, and production deployment remain deferred.
