# Tenant Context Foundation

Tenant context helpers resolve the active organization from the authenticated session and membership graph.

All future tenant-owned queries should receive an explicit `DatabaseAccessContext` and filter by `organizationId` unless the caller has explicit platform context.
