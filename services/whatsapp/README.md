# WhatsApp Business Foundation

Phase 12 adds a provider-agnostic WhatsApp Business integration foundation.

- Provider adapters implement `WhatsappProviderAdapter`.
- Webhooks normalize vendor payloads into `IncomingWhatsappMessage`.
- Organization-specific settings are stored in `OrganizationSettings.metadata.whatsappBusiness`.
- The pipeline identifies customers, creates print jobs from received media, records customer activity, sends in-app confirmation notifications, and writes audit logs.
- No vendor-specific assumptions are hardcoded into the application architecture.
