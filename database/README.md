# FLUXA Database Foundation

Phase 3 introduces the PostgreSQL and Prisma foundation for the FLUXA multi-tenant SaaS platform.

## Scope

This phase defines only the normalized platform foundation:

- Organizations and organization settings.
- Users and organization memberships.
- Platform and organization role-based access control.
- Feature modules and organization-level module toggles.
- Sessions and refresh-token persistence.
- Platform settings.
- Audit logs.

Print jobs, files, printers, OTP records, notifications, billing, analytics, and support tickets are intentionally deferred to later domain phases.

## Multi-Tenant Rule

Every tenant-owned model must include an `organizationId` either directly or through a required parent relation. Application services must enforce organization context on every tenant-scoped query. The Master Developer may bypass tenant filters only through explicit platform authorization.

## Migration Workflow

When dependencies and database access are available:

```bash
npx prisma generate
npx prisma migrate dev --name init_foundation
```

Production migrations should be reviewed before deployment and applied through CI/CD or a controlled release process.
