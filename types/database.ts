export type TenantContext = {
  organizationId: string;
  userId: string;
  isPlatformContext?: false;
};

export type PlatformContext = {
  userId: string;
  isPlatformContext: true;
};

export type DatabaseAccessContext = TenantContext | PlatformContext;
