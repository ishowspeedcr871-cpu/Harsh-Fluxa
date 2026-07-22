# Authentication Foundation

Phase 4 introduces the server-side authentication foundation for FLUXA.

## Scope

- Password hashing and verification with Node.js `scrypt`.
- Secure random session token generation.
- HTTP-only session cookie management.
- Database-backed session and refresh-token validation.
- Login and logout server actions.

Future iterations should add invitation onboarding, password reset, MFA/OTP for account security, rate limiting, and complete session rotation flows.
