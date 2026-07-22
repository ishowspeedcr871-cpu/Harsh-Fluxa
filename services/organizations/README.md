# Organization Services

Organization services are the Phase 5 tenant-management boundary.

All reads and writes must be scoped by an authenticated session. Mutations require platform context or an active membership in the target organization. Future domain services should depend on these helpers rather than resolving tenants directly from page code.
