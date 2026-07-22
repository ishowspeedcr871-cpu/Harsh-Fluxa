const fs = require('fs');

const schemaParts = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserStatus {
  ACTIVE
  INVITED
  SUSPENDED
  DELETED
}

enum OrganizationStatus {
  ACTIVE
  SUSPENDED
  ARCHIVED
}

enum MembershipStatus {
  ACTIVE
  INVITED
  SUSPENDED
  REMOVED
}

enum RoleScope {
  PLATFORM
  ORGANIZATION
  CUSTOMER
}

enum SessionStatus {
  ACTIVE
  REVOKED
  EXPIRED
}

enum AuditSeverity {
  INFO
  WARNING
  CRITICAL
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  REVOKED
  EXPIRED
}

enum PrintJobStatus {
  DRAFT
  UPLOADED
  VALIDATING
  QUEUED
  ASSIGNED
  PRINTING
  READY
  OTP_GENERATED
  COLLECTED
  COMPLETED
  CANCELLED
  FAILED
}

enum UploadStatus {
  PENDING
  UPLOADING
  UPLOADED
  VALIDATING
  READY
  FAILED
}

enum CustomerNotificationStatus {
  UNREAD
  READ
  ARCHIVED
}

enum NotificationAudience {
  USER
  ORGANIZATION
  PLATFORM
}

enum NotificationType {
  NEW_JOB
  JOB_ASSIGNED
  JOB_STATUS_UPDATED
  OTP_GENERATED
  JOB_COLLECTED
  INVITATION_EVENT
  ORGANIZATION_EVENT
  SYSTEM_ANNOUNCEMENT
}

enum NotificationStatus {
  UNREAD
  READ
  ARCHIVED
}

enum PrintJobOtpStatus {
  ACTIVE
  VERIFIED
  EXPIRED
  REVOKED
}

enum PrintJobPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum PrinterStatus {
  ONLINE
  BUSY
  OFFLINE
  MAINTENANCE
}

enum PrinterHealth {
  GOOD
  WARNING
  CRITICAL
}

model Organization {
  id                     String                      @id @default(cuid())
  name                   String
  slug                   String                      @unique
  status                 OrganizationStatus          @default(ACTIVE)
  timezone               String                      @default("UTC")
  currency               String                      @default("USD")
  settings               OrganizationSettings?
  memberships            Membership[]
  invitations            MembershipInvitation[]
  modules                OrganizationFeatureModule[]
  auditLogs              AuditLog[]
  printJobs              PrintJob[]
  printers               Printer[]
  notifications          CustomerNotification[]
  appNotifications       Notification[]
  activities             CustomerActivity[]
  aiProviders            AiProvider[]
  aiConfiguration        AiConfiguration?
  aiPromptTemplates      AiPromptTemplate[]
  aiRequests             AiRequest[]
  aiUsageStats           AiUsageStatistic[]
  aiProviderHealth       AiProviderHealth[]
  aiAuditLogs            AiAuditLog[]
  ocrJobs                OcrJob[]
  documentAnalyses       DocumentAnalysis[]
  ocrAnalytics           OcrAnalytic[]
  ocrAuditLogs           OcrAuditLog[]
  aiPrintRecommendations AiPrintRecommendation[]
  automationRules        AutomationRule[]
  automationExecutions   AutomationExecution[]
  savedSearches          SavedSearch[]
  searchHistory          SearchHistory[]
  aiAnalyticsSnapshots   AiAnalyticsSnapshot[]
  createdAt              DateTime                    @default(now())
  updatedAt              DateTime                    @updatedAt
  deletedAt              DateTime?

  @@index([status])
  @@index([deletedAt])
}

model OrganizationSettings {
  id             String       @id @default(cuid())
  organizationId String       @unique
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  displayName    String?
  supportEmail   String?
  supportPhone   String?
  metadata       Json?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model User {
  id                       String                     @id @default(cuid())
  email                    String                     @unique
  name                     String?
  imageUrl                 String?
  passwordHash             String?
  emailVerifiedAt          DateTime?
  status                   UserStatus                 @default(ACTIVE)
  memberships              Membership[]
  sentInvitations          MembershipInvitation[]     @relation("InvitationInviter")
  acceptedInvitations      MembershipInvitation[]     @relation("InvitationAcceptedBy")
  sessions                 Session[]
  refreshTokens            RefreshToken[]
  auditLogs                AuditLog[]
  notifications            Notification[]
  customerPrintJobs        PrintJob[]                 @relation("CustomerPrintJobs")
  assignedPrintJobs        PrintJob[]                 @relation("AssignedPrintJobs")
  printJobEvents           PrintJobEvent[]
  generatedPrintJobOtps    PrintJobOtp[]              @relation("GeneratedPrintJobOtps")
  verifiedPrintJobOtps     PrintJobOtp[]              @relation("VerifiedPrintJobOtps")
  printerAssignments       PrinterAssignment[]
  customerNotifications    CustomerNotification[]
  customerActivities       CustomerActivity[]
  aiRequests               AiRequest[]
  aiAuditLogs              AiAuditLog[]
  requestedOcrJobs         OcrJob[]
  ocrAuditLogs             OcrAuditLog[]
  aiPrintRecommendations   AiPrintRecommendation[]
  aiRecommendationFeedback AiRecommendationFeedback[]
  automationRulesCreated   AutomationRule[]
  savedSearches            SavedSearch[]
  searchHistory            SearchHistory[]
  createdAt                DateTime                   @default(now())
  updatedAt                DateTime                   @updatedAt
  deletedAt                DateTime?

  @@index([status])
  @@index([deletedAt])
}

model Membership {
  id             String           @id @default(cuid())
  organizationId String
  organization   Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userId         String
  user           User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  roleId         String
  role           Role             @relation(fields: [roleId], references: [id])
  status         MembershipStatus @default(ACTIVE)
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  deletedAt      DateTime?

  @@unique([organizationId, userId])
  @@index([organizationId, status])
  @@index([userId, status])
  @@index([roleId])
}

model MembershipInvitation {
  id               String           @id @default(cuid())
  organizationId   String
  organization     Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  email            String
  roleId           String
  role             Role             @relation(fields: [roleId], references: [id])
  tokenHash        String           @unique
  status           InvitationStatus @default(PENDING)
  invitedByUserId  String?
  invitedByUser    User?            @relation("InvitationInviter", fields: [invitedByUserId], references: [id], onDelete: SetNull)
  acceptedByUserId String?
  acceptedByUser   User?            @relation("InvitationAcceptedBy", fields: [acceptedByUserId], references: [id], onDelete: SetNull)
  acceptedAt       DateTime?
  revokedAt        DateTime?
  expiresAt        DateTime
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  @@index([organizationId, status])
  @@index([email, status])
  @@index([roleId])
  @@index([expiresAt])
}

model Role {
  id          String                 @id @default(cuid())
  key         String                 @unique
  name        String
  description String?
  scope       RoleScope
  isSystem    Boolean                @default(false)
  permissions RolePermission[]
  memberships Membership[]
  invitations MembershipInvitation[]
  createdAt   DateTime               @default(now())
  updatedAt   DateTime               @updatedAt

  @@index([scope])
}

model Permission {
  id          String           @id @default(cuid())
  key         String           @unique
  name        String
  description String?
  scope       RoleScope
  roles       RolePermission[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@index([scope])
}

model RolePermission {
  roleId       String
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permissionId String
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  createdAt    DateTime   @default(now())

  @@id([roleId, permissionId])
  @@index([permissionId])
}

model FeatureModule {
  id                  String                      @id @default(cuid())
  key                 String                      @unique
  name                String
  description         String?
  isCore              Boolean                     @default(false)
  isEnabledByDefault  Boolean                     @default(false)
  organizationModules OrganizationFeatureModule[]
  createdAt           DateTime                    @default(now())
  updatedAt           DateTime                    @updatedAt
}

model OrganizationFeatureModule {
  organizationId String
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  moduleId       String
  module         FeatureModule @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  enabled        Boolean       @default(false)
  configuredAt   DateTime      @default(now())
  metadata       Json?

  @@id([organizationId, moduleId])
  @@index([moduleId, enabled])
}

model Printer {
  id             String              @id @default(cuid())
  organizationId String
  organization   Organization        @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name           String
  location       String?
  model          String?
  status         PrinterStatus       @default(ONLINE)
  health         PrinterHealth       @default(GOOD)
  isColor        Boolean             @default(true)
  supportsDuplex Boolean             @default(true)
  maxPageSize    String              @default("A4")
  jobs           PrintJob[]
  assignments    PrinterAssignment[]
  createdAt      DateTime            @default(now())
  updatedAt      DateTime            @updatedAt
  deletedAt      DateTime?

  @@index([organizationId, status, health])
  @@index([deletedAt])
}

model PrinterAssignment {
  id             String   @id @default(cuid())
  printerId      String
  printer        Printer  @relation(fields: [printerId], references: [id], onDelete: Cascade)
  assignedUserId String
  assignedUser   User     @relation(fields: [assignedUserId], references: [id], onDelete: Cascade)
  createdAt      DateTime @default(now())

  @@unique([printerId, assignedUserId])
  @@index([assignedUserId])
}

model PrintJob {
  id                     String                  @id @default(cuid())
  organizationId         String
  organization           Organization            @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  customerUserId         String
  customerUser           User                    @relation("CustomerPrintJobs", fields: [customerUserId], references: [id], onDelete: Cascade)
  assignedUserId         String?
  assignedUser           User?                   @relation("AssignedPrintJobs", fields: [assignedUserId], references: [id], onDelete: SetNull)
  printerId              String?
  printer                Printer?                @relation(fields: [printerId], references: [id], onDelete: SetNull)
  title                  String
  description            String?
  status                 PrintJobStatus          @default(DRAFT)
  priority               PrintJobPriority        @default(NORMAL)
  copies                 Int                     @default(1)
  color                  Boolean                 @default(false)
  duplex                 Boolean                 @default(true)
  pageCount              Int?
  estimatedCost          Decimal?                @db.Decimal(10, 2)
  otpCodeHash            String?
  otpGeneratedAt         DateTime?
  collectedAt            DateTime?
  completedAt            DateTime?
  cancelledAt            DateTime?
  queuedAt               DateTime?
  assignedAt             DateTime?
  processingStartedAt    DateTime?
  pausedAt               DateTime?
  readyAt                DateTime?
  metadata               Json?
  files                  PrintJobFile[]
  events                 PrintJobEvent[]
  otpHistory             PrintJobOtp[]
  notifications          CustomerNotification[]
  activities             CustomerActivity[]
  aiPrintRecommendations AiPrintRecommendation[]
  automationExecutions   AutomationExecution[]
  createdAt              DateTime                @default(now())
  updatedAt              DateTime                @updatedAt

  @@index([organizationId, status, createdAt])
  @@index([customerUserId, createdAt])
  @@index([assignedUserId, status])
  @@index([printerId, status])
  @@index([priority, createdAt])
}

model PrintJobOtp {
  id                String            @id @default(cuid())
  printJobId        String
  printJob          PrintJob          @relation(fields: [printJobId], references: [id], onDelete: Cascade)
  codeHash          String
  status            PrintJobOtpStatus @default(ACTIVE)
  generatedByUserId String?
  generatedByUser   User?             @relation("GeneratedPrintJobOtps", fields: [generatedByUserId], references: [id], onDelete: SetNull)
  verifiedByUserId  String?
  verifiedByUser    User?             @relation("VerifiedPrintJobOtps", fields: [verifiedByUserId], references: [id], onDelete: SetNull)
  expiresAt         DateTime
  verifiedAt        DateTime?
  revokedAt         DateTime?
  createdAt         DateTime          @default(now())

  @@index([printJobId, status, expiresAt])
  @@index([generatedByUserId, createdAt])
  @@index([verifiedByUserId, verifiedAt])
}

model PrintJobFile {
  id                     String                  @id @default(cuid())
  printJobId             String
  printJob               PrintJob                @relation(fields: [printJobId], references: [id], onDelete: Cascade)
  fileName               String
  fileSize               Int
  mimeType               String
  storageKey             String?
  previewUrl             String?
  status                 UploadStatus            @default(PENDING)
  progress               Int                     @default(0)
  validationError        String?
  ocrJobs                OcrJob[]
  documentAnalyses       DocumentAnalysis[]
  aiPrintRecommendations AiPrintRecommendation[]
  createdAt              DateTime                @default(now())
  updatedAt              DateTime                @updatedAt

  @@index([printJobId, status])
}

model PrintJobEvent {
  id          String          @id @default(cuid())
  printJobId  String
  printJob    PrintJob        @relation(fields: [printJobId], references: [id], onDelete: Cascade)
  actorUserId String?
  actorUser   User?           @relation(fields: [actorUserId], references: [id], onDelete: SetNull)
  fromStatus  PrintJobStatus?
  toStatus    PrintJobStatus
  note        String?
  metadata    Json?
  createdAt   DateTime        @default(now())

  @@index([printJobId, createdAt])
  @@index([actorUserId, createdAt])
}

model CustomerNotification {
  id             String                     @id @default(cuid())
  organizationId String
  organization   Organization               @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userId         String
  user           User                       @relation(fields: [userId], references: [id], onDelete: Cascade)
  printJobId     String?
  printJob       PrintJob?                  @relation(fields: [printJobId], references: [id], onDelete: Cascade)
  title          String
  message        String
  status         CustomerNotificationStatus @default(UNREAD)
  createdAt      DateTime                   @default(now())
  readAt         DateTime?

  @@index([organizationId, userId, status, createdAt])
  @@index([printJobId])
}

model CustomerActivity {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userId         String
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  printJobId     String?
  printJob       PrintJob?    @relation(fields: [printJobId], references: [id], onDelete: SetNull)
  action         String
  description    String
  metadata       Json?
  createdAt      DateTime     @default(now())

  @@index([organizationId, userId, createdAt])
  @@index([printJobId])
}

model Notification {
  id             String               @id @default(cuid())
  organizationId String?
  organization   Organization?        @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userId         String?
  user           User?                @relation(fields: [userId], references: [id], onDelete: Cascade)
  audience       NotificationAudience @default(USER)
  type           NotificationType
  status         NotificationStatus   @default(UNREAD)
  title          String
  message        String
  entityType     String?
  entityId       String?
  metadata       Json?
  readAt         DateTime?
  archivedAt     DateTime?
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt

  @@index([organizationId, status, createdAt])
  @@index([userId, status, createdAt])
  @@index([audience, type, createdAt])
  @@index([entityType, entityId])
}

model Session {
  id        String        @id @default(cuid())
  userId    String
  user      User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  status    SessionStatus @default(ACTIVE)
  userAgent String?
  ipAddress String?
  expiresAt DateTime
  createdAt DateTime      @default(now())
  revokedAt DateTime?

  @@index([userId, status])
  @@index([expiresAt])
}

model RefreshToken {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash String    @unique
  expiresAt DateTime
  rotatedAt DateTime?
  revokedAt DateTime?
  createdAt DateTime  @default(now())

  @@index([userId])
  @@index([expiresAt])
}

model PlatformSettings {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model AuditLog {
  id             String        @id @default(cuid())
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  actorUserId    String?
  actorUser      User?         @relation(fields: [actorUserId], references: [id], onDelete: SetNull)
  action         String
  entityType     String?
  entityId       String?
  severity       AuditSeverity @default(INFO)
  metadata       Json?
  ipAddress      String?
  userAgent      String?
  requestId      String?
  createdAt      DateTime      @default(now())

  @@index([organizationId, createdAt])
  @@index([actorUserId, createdAt])
  @@index([action])
  @@index([severity])
}

enum AiProviderStatus {
  ACTIVE
  INACTIVE
  DEGRADED
  DISABLED
}

enum AiModelStatus {
  ACTIVE
  INACTIVE
  DEPRECATED
}

enum AiRequestStatus {
  QUEUED
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
  TIMED_OUT
}

enum AiPromptTemplateStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum AiHealthStatus {
  HEALTHY
  DEGRADED
  UNAVAILABLE
  UNKNOWN
}

model AiProvider {
  id                String             @id @default(cuid())
  organizationId    String?
  organization      Organization?      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  key               String
  name              String
  status            AiProviderStatus   @default(INACTIVE)
  baseUrl           String?
  defaultTimeoutMs  Int                @default(30000)
  defaultRetryCount Int                @default(2)
  supportsStreaming Boolean            @default(false)
  metadata          Json?
  models            AiModel[]
  requests          AiRequest[]
  healthChecks      AiProviderHealth[]
  usageStats        AiUsageStatistic[]
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  deletedAt         DateTime?
  aiConfigurations  AiConfiguration[]

  @@unique([organizationId, key])
  @@index([organizationId, status])
  @@index([deletedAt])
}

model AiModel {
  id                String             @id @default(cuid())
  providerId        String
  provider          AiProvider         @relation(fields: [providerId], references: [id], onDelete: Cascade)
  key               String
  name              String
  status            AiModelStatus      @default(ACTIVE)
  contextWindow     Int?
  supportsStreaming Boolean            @default(false)
  inputModalities   Json?
  outputModalities  Json?
  metadata          Json?
  requests          AiRequest[]
  usageStats        AiUsageStatistic[]
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  deletedAt         DateTime?
  aiConfigurations  AiConfiguration[]

  @@unique([providerId, key])
  @@index([providerId, status])
  @@index([deletedAt])
}

model AiConfiguration {
  id                 String       @id @default(cuid())
  organizationId     String       @unique
  organization       Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  defaultProviderId  String?
  defaultProvider    AiProvider?  @relation(fields: [defaultProviderId], references: [id], onDelete: SetNull)
  defaultModelId     String?
  defaultModel       AiModel?     @relation(fields: [defaultModelId], references: [id], onDelete: SetNull)
  isEnabled          Boolean      @default(false)
  streamingEnabled   Boolean      @default(false)
  timeoutMs          Int          @default(30000)
  retryCount         Int          @default(2)
  rateLimitPerMinute Int          @default(60)
  secretPolicy       Json?
  featureFlags       Json?
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt
}

model AiPromptTemplate {
  id             String                 @id @default(cuid())
  organizationId String?
  organization   Organization?          @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  key            String
  name           String
  description    String?
  status         AiPromptTemplateStatus @default(DRAFT)
  version        Int                    @default(1)
  template       String
  variables      Json?
  metadata       Json?
  requests       AiRequest[]
  createdAt      DateTime               @default(now())
  updatedAt      DateTime               @updatedAt
  archivedAt     DateTime?

  @@unique([organizationId, key, version])
  @@index([organizationId, status])
}

model AiRequest {
  id                     String                  @id @default(cuid())
  organizationId         String
  organization           Organization            @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  actorUserId            String?
  actorUser              User?                   @relation(fields: [actorUserId], references: [id], onDelete: SetNull)
  providerId             String?
  provider               AiProvider?             @relation(fields: [providerId], references: [id], onDelete: SetNull)
  modelId                String?
  model                  AiModel?                @relation(fields: [modelId], references: [id], onDelete: SetNull)
  promptTemplateId       String?
  promptTemplate         AiPromptTemplate?       @relation(fields: [promptTemplateId], references: [id], onDelete: SetNull)
  featureKey             String
  status                 AiRequestStatus         @default(QUEUED)
  requestHash            String
  inputTokens            Int                     @default(0)
  outputTokens           Int                     @default(0)
  totalTokens            Int                     @default(0)
  timeoutMs              Int
  retryCount             Int
  attempts               Int                     @default(0)
  streamRequested        Boolean                 @default(false)
  metadata               Json?
  errorCode              String?
  errorMessage           String?
  startedAt              DateTime?
  completedAt            DateTime?
  createdAt              DateTime                @default(now())
  responses              AiResponse[]
  auditLogs              AiAuditLog[]
  ocrJobs                OcrJob[]
  aiPrintRecommendations AiPrintRecommendation[]

  @@index([organizationId, status, createdAt])
  @@index([actorUserId, createdAt])
  @@index([providerId, createdAt])
  @@index([modelId, createdAt])
  @@index([featureKey, createdAt])
}

model AiResponse {
  id           String    @id @default(cuid())
  requestId    String
  request      AiRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  responseHash String
  finishReason String?
  latencyMs    Int?
  metadata     Json?
  createdAt    DateTime  @default(now())

  @@index([requestId, createdAt])
}

model AiUsageStatistic {
  id             String        @id @default(cuid())
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  providerId     String?
  provider       AiProvider?   @relation(fields: [providerId], references: [id], onDelete: SetNull)
  modelId        String?
  model          AiModel?      @relation(fields: [modelId], references: [id], onDelete: SetNull)
  featureKey     String
  periodStart    DateTime
  periodEnd      DateTime
  requestCount   Int           @default(0)
  successCount   Int           @default(0)
  failureCount   Int           @default(0)
  inputTokens    Int           @default(0)
  outputTokens   Int           @default(0)
  totalTokens    Int           @default(0)
  estimatedCost  Decimal?      @db.Decimal(12, 4)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@unique([organizationId, providerId, modelId, featureKey, periodStart])
  @@index([organizationId, periodStart])
  @@index([providerId, periodStart])
}

model AiProviderHealth {
  id             String         @id @default(cuid())
  providerId     String
  provider       AiProvider     @relation(fields: [providerId], references: [id], onDelete: Cascade)
  organizationId String?
  organization   Organization?  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  status         AiHealthStatus @default(UNKNOWN)
  latencyMs      Int?
  checkedAt      DateTime       @default(now())
  message        String?
  metadata       Json?

  @@index([providerId, checkedAt])
  @@index([organizationId, checkedAt])
  @@index([status, checkedAt])
}

model AiAuditLog {
  id             String        @id @default(cuid())
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  actorUserId    String?
  actorUser      User?         @relation(fields: [actorUserId], references: [id], onDelete: SetNull)
  requestId      String?
  request        AiRequest?    @relation(fields: [requestId], references: [id], onDelete: SetNull)
  action         String
  severity       AuditSeverity @default(INFO)
  metadata       Json?
  createdAt      DateTime      @default(now())

  @@index([organizationId, createdAt])
  @@index([actorUserId, createdAt])
  @@index([requestId, createdAt])
  @@index([action])
  @@index([severity])
}

enum OcrJobStatus {
  QUEUED
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
  RETRYING
}

enum OcrSourceType {
  PRINT_JOB_FILE
  EXTERNAL_DOCUMENT
}

enum DocumentFileHealth {
  HEALTHY
  WARNING
  CRITICAL
  UNKNOWN
}

enum DocumentImageQuality {
  HIGH
  MEDIUM
  LOW
  UNKNOWN
}

model OcrJob {
  id                String            @id @default(cuid())
  organizationId    String
  organization      Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  requestedByUserId String?
  requestedByUser   User?             @relation(fields: [requestedByUserId], references: [id], onDelete: SetNull)
  printJobFileId    String?
  printJobFile      PrintJobFile?     @relation(fields: [printJobFileId], references: [id], onDelete: SetNull)
  aiRequestId       String?
  aiRequest         AiRequest?        @relation(fields: [aiRequestId], references: [id], onDelete: SetNull)
  sourceType        OcrSourceType     @default(PRINT_JOB_FILE)
  status            OcrJobStatus      @default(QUEUED)
  priority          PrintJobPriority  @default(NORMAL)
  languageHint      String?
  requestedFeatures Json?
  attemptCount      Int               @default(0)
  maxAttempts       Int               @default(3)
  timeoutMs         Int               @default(60000)
  errorCode         String?
  errorMessage      String?
  queuedAt          DateTime          @default(now())
  startedAt         DateTime?
  completedAt       DateTime?
  nextRetryAt       DateTime?
  metadata          Json?
  result            OcrResult?
  documentMetadata  OcrMetadata?
  analysis          DocumentAnalysis?
  auditLogs         OcrAuditLog[]
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  @@index([organizationId, status, queuedAt])
  @@index([printJobFileId, createdAt])
  @@index([aiRequestId])
  @@index([requestedByUserId, createdAt])
}

model OcrResult {
  id                   String   @id @default(cuid())
  ocrJobId             String   @unique
  ocrJob               OcrJob   @relation(fields: [ocrJobId], references: [id], onDelete: Cascade)
  extractedTextHash    String?
  extractedTextPreview String?
  confidence           Float?
  pageResults          Json?
  language             String?
  providerMetadata     Json?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

model OcrMetadata {
  id               String               @id @default(cuid())
  ocrJobId         String               @unique
  ocrJob           OcrJob               @relation(fields: [ocrJobId], references: [id], onDelete: Cascade)
  pageCount        Int?
  orientation      String?
  paperSize        String?
  language         String?
  colorUsage       Json?
  blankPages       Json?
  duplicatePages   Json?
  imageQuality     DocumentImageQuality @default(UNKNOWN)
  inkUsage         Json?
  printCost        Decimal?             @db.Decimal(10, 2)
  printTimeSeconds Int?
  fileHealth       DocumentFileHealth   @default(UNKNOWN)
  metadata         Json?
  createdAt        DateTime             @default(now())
  updatedAt        DateTime             @updatedAt
}

model DocumentAnalysis {
  id                        String                  @id @default(cuid())
  organizationId            String
  organization              Organization            @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  ocrJobId                  String?                 @unique
  ocrJob                    OcrJob?                 @relation(fields: [ocrJobId], references: [id], onDelete: SetNull)
  printJobFileId            String?
  printJobFile              PrintJobFile?           @relation(fields: [printJobFileId], references: [id], onDelete: SetNull)
  summary                   String
  pageCount                 Int?
  orientation               String?
  paperSize                 String?
  language                  String?
  colorUsage                Json?
  blankPageCount            Int                     @default(0)
  duplicatePageCount        Int                     @default(0)
  imageQuality              DocumentImageQuality    @default(UNKNOWN)
  estimatedInkUsage         Json?
  estimatedPrintCost        Decimal?                @db.Decimal(10, 2)
  estimatedPrintTimeSeconds Int?
  fileHealth                DocumentFileHealth      @default(UNKNOWN)
  report                    Json?
  aiPrintRecommendations    AiPrintRecommendation[]
  createdAt                 DateTime                @default(now())
  updatedAt                 DateTime                @updatedAt

  @@index([organizationId, createdAt])
  @@index([printJobFileId, createdAt])
  @@index([fileHealth, createdAt])
}

model OcrAnalytic {
  id                String        @id @default(cuid())
  organizationId    String?
  organization      Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  periodStart       DateTime
  periodEnd         DateTime
  jobCount          Int           @default(0)
  completedCount    Int           @default(0)
  failedCount       Int           @default(0)
  pageCount         Int           @default(0)
  totalFileBytes    Int           @default(0)
  averageConfidence Float?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@unique([organizationId, periodStart])
  @@index([organizationId, periodStart])
}

model OcrAuditLog {
  id             String        @id @default(cuid())
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  actorUserId    String?
  actorUser      User?         @relation(fields: [actorUserId], references: [id], onDelete: SetNull)
  ocrJobId       String?
  ocrJob         OcrJob?       @relation(fields: [ocrJobId], references: [id], onDelete: SetNull)
  action         String
  severity       AuditSeverity @default(INFO)
  metadata       Json?
  createdAt      DateTime      @default(now())

  @@index([organizationId, createdAt])
  @@index([actorUserId, createdAt])
  @@index([ocrJobId, createdAt])
  @@index([action])
  @@index([severity])
}

enum AiRecommendationStatus {
  ACTIVE
  ACCEPTED
  REJECTED
  SUPERSEDED
}

enum AutomationRuleStatus {
  ACTIVE
  PAUSED
  ARCHIVED
}

enum AutomationTriggerType {
  PRINT_JOB_CREATED
  PRINT_JOB_UPDATED
  OCR_COMPLETED
  DOCUMENT_ANALYZED
  SCHEDULED
  MANUAL
}

enum AutomationExecutionStatus {
  QUEUED
  RUNNING
  COMPLETED
  FAILED
  SKIPPED
}

enum SearchScope {
  ALL
  CUSTOMERS
  ORGANIZATIONS
  EMPLOYEES
  JOBS
  FILES
  OCR
  AI_ANALYSIS
}

model AiPrintRecommendation {
  id                     String                     @id @default(cuid())
  organizationId         String
  organization           Organization               @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  printJobId             String?
  printJob               PrintJob?                  @relation(fields: [printJobId], references: [id], onDelete: SetNull)
  printJobFileId         String?
  printJobFile           PrintJobFile?              @relation(fields: [printJobFileId], references: [id], onDelete: SetNull)
  documentAnalysisId     String?
  documentAnalysis       DocumentAnalysis?          @relation(fields: [documentAnalysisId], references: [id], onDelete: SetNull)
  aiRequestId            String?
  aiRequest              AiRequest?                 @relation(fields: [aiRequestId], references: [id], onDelete: SetNull)
  status                 AiRecommendationStatus     @default(ACTIVE)
  recommendedPaperSize   String?
  recommendedDuplex      Boolean?
  recommendedColor       Boolean?
  recommendedOrientation String?
  recommendedQuality     String?
  recommendedScaling     String?
  costOptimization       Json?
  inkOptimization        Json?
  paperSavings           Json?
  environmentalImpact    Json?
  confidenceScore        Float?
  explanations           Json
  createdByUserId        String?
  createdByUser          User?                      @relation(fields: [createdByUserId], references: [id], onDelete: SetNull)
  acceptedAt             DateTime?
  rejectedAt             DateTime?
  createdAt              DateTime                   @default(now())
  updatedAt              DateTime                   @updatedAt
  feedback               AiRecommendationFeedback[]

  @@index([organizationId, status, createdAt])
  @@index([printJobId, createdAt])
  @@index([printJobFileId, createdAt])
}

model AiRecommendationFeedback {
  id               String                @id @default(cuid())
  recommendationId String
  recommendation   AiPrintRecommendation @relation(fields: [recommendationId], references: [id], onDelete: Cascade)
  actorUserId      String?
  actorUser        User?                 @relation(fields: [actorUserId], references: [id], onDelete: SetNull)
  accepted         Boolean
  reason           String?
  createdAt        DateTime              @default(now())

  @@index([recommendationId, createdAt])
  @@index([actorUserId, createdAt])
}

model AutomationRule {
  id               String                @id @default(cuid())
  organizationId   String
  organization     Organization          @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name             String
  description      String?
  status           AutomationRuleStatus  @default(ACTIVE)
  triggerType      AutomationTriggerType
  conditions       Json
  actions          Json
  priority         Int                   @default(100)
  rateLimitPerHour Int                   @default(120)
  lastRunAt        DateTime?
  createdByUserId  String?
  createdByUser    User?                 @relation(fields: [createdByUserId], references: [id], onDelete: SetNull)
  executions       AutomationExecution[]
  createdAt        DateTime              @default(now())
  updatedAt        DateTime              @updatedAt
  archivedAt       DateTime?

  @@index([organizationId, status, triggerType])
  @@index([priority])
}

model AutomationExecution {
  id             String                    @id @default(cuid())
  organizationId String
  organization   Organization              @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  ruleId         String
  rule           AutomationRule            @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  printJobId     String?
  printJob       PrintJob?                 @relation(fields: [printJobId], references: [id], onDelete: SetNull)
  status         AutomationExecutionStatus @default(QUEUED)
  triggeredBy    String?
  error          String?
  logs           Json?
  startedAt      DateTime?
  completedAt    DateTime?
  createdAt      DateTime                  @default(now())
  updatedAt      DateTime                  @updatedAt

  @@index([organizationId, status, createdAt])
  @@index([ruleId, status])
}

model SavedSearch {
  id             String      @id @default(cuid())
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userId         String
  user           User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  name           String
  query          String
  scope          SearchScope @default(ALL)
  filters        Json?
  isGlobal       Boolean     @default(false)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  @@index([userId, isGlobal])
  @@index([organizationId])
}

model SearchHistory {
  id             String      @id @default(cuid())
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userId         String
  user           User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  query          String
  scope          SearchScope @default(ALL)
  filters        Json?
  resultCount    Int         @default(0)
  createdAt      DateTime    @default(now())

  @@index([userId, createdAt])
  @@index([organizationId, createdAt])
}

model AiAnalyticsSnapshot {
  id             String       @id @default(cuid())
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  periodStart    DateTime
  periodEnd      DateTime
  metrics        Json
  createdAt      DateTime     @default(now())

  @@index([organizationId, periodStart])
}
`;

fs.writeFileSync('prisma/schema.prisma', schemaParts);
