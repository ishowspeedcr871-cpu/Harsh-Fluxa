# Organizations Feature

Phase 5 owns the multi-tenant organization management foundation.

## Scope

- Organization onboarding.
- Organization CRUD contracts.
- Organization settings contracts.
- Organization switching.
- Tenant-aware organization dashboard surfaces.

Print-domain data must never be queried without an organization context supplied by this feature and the tenant service layer.
