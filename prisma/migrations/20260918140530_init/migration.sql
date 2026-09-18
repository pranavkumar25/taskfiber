-- CreateEnum
CREATE TYPE "Vertical" AS ENUM ('MARKETING', 'DESIGN', 'PRODUCT', 'TECH', 'INFLUENCER', 'TALENT');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('INTERNAL', 'CLIENT_VISIBLE');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'LIMITED');

-- CreateEnum
CREATE TYPE "ContactRole" AS ENUM ('APPROVER', 'COLLABORATOR', 'VIEWER', 'BILLING');

-- CreateEnum
CREATE TYPE "ClientStage" AS ENUM ('PROSPECT', 'ONBOARDING', 'ACTIVE', 'AT_RISK', 'RENEWAL', 'OFFBOARDED');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('RETAINER', 'PROJECT', 'CAMPAIGN', 'SPRINT', 'BOOKING', 'ROADMAP');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ON_TRACK', 'AT_RISK', 'BLOCKED', 'DONE');

-- CreateEnum
CREATE TYPE "MilestoneState" AS ENUM ('DONE', 'DUE', 'AT_RISK', 'MISSED', 'UPCOMING');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'IN_REVIEW', 'WAITING', 'AT_RISK', 'DONE');

-- CreateEnum
CREATE TYPE "DeliverableStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "PreviewKind" AS ENUM ('CREATIVE', 'FIGMA', 'REEL', 'DOCUMENT', 'WEB');

-- CreateEnum
CREATE TYPE "ApprovalState" AS ENUM ('WAITING', 'APPROVED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "ApprovalDecision" AS ENUM ('APPROVED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('PORTAL', 'EMAIL', 'WHATSAPP', 'VERBAL');

-- CreateEnum
CREATE TYPE "ContractKind" AS ENUM ('RETAINER', 'MSA', 'SOW', 'PROJECT');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'SENT', 'SIGNED', 'ACTIVE', 'EXPIRING', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'OPEN', 'OVERDUE', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentRail" AS ENUM ('RAZORPAY_UPI', 'RAZORPAY_CARD', 'STRIPE_CARD', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('CONTRACT', 'BRIEF', 'REPORT', 'CREATIVE', 'INVOICE');

-- CreateEnum
CREATE TYPE "ModuleKey" AS ENUM ('OVERVIEW', 'TIMELINE', 'DELIVERABLES', 'DASHBOARDS', 'DOCUMENTS', 'CONTRACTS', 'INVOICES', 'UPDATES', 'REQUESTS', 'TEAM', 'MEETINGS', 'ASSETS', 'ROSTER');

-- CreateEnum
CREATE TYPE "IntegrationCategory" AS ENUM ('STORAGE', 'ESIGN', 'ACCOUNTING', 'PAYMENTS', 'CRM', 'ANALYTICS', 'DESIGN', 'DEV', 'SOCIAL', 'MESSAGING', 'MEETINGS', 'REPORTING');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('CONNECTED', 'NOT_CONNECTED', 'FAILING', 'EMBED');

-- CreateEnum
CREATE TYPE "SyncMode" AS ENUM ('TWO_WAY', 'PUBLISH_ON_DEMAND');

-- CreateEnum
CREATE TYPE "DealStage" AS ENUM ('PROPOSAL', 'NEGOTIATION', 'VERBAL_YES', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "RosterStatus" AS ENUM ('BRIEFED', 'CONTRACTED', 'CONTENT_IN_REVIEW', 'POSTED');

-- CreateEnum
CREATE TYPE "ReportState" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ActivitySource" AS ENUM ('DRIVE', 'PORTAL', 'EMAIL', 'WHATSAPP', 'SYSTEM');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "StepState" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "IntakeFieldType" AS ENUM ('TEXT', 'CHOICE', 'FILE', 'CONTACT');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "vertical" "Vertical" NOT NULL,
    "city" TEXT,
    "teamSize" TEXT,
    "accentHex" TEXT NOT NULL DEFAULT '#1E40AF',
    "logoAsset" TEXT,
    "portalDomain" TEXT NOT NULL,
    "customDomain" TEXT,
    "dnsVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailSender" TEXT,
    "poweredBy" BOOLEAN NOT NULL DEFAULT true,
    "plan" TEXT NOT NULL DEFAULT 'studio',
    "seats" INTEGER NOT NULL DEFAULT 5,
    "driveRootPath" TEXT,
    "clientsRootPath" TEXT,
    "syncMode" "SyncMode" NOT NULL DEFAULT 'PUBLISH_ON_DEMAND',
    "defaultApprovalDays" INTEGER NOT NULL DEFAULT 3,
    "reminderTone" TEXT NOT NULL DEFAULT 'plain',
    "lastExportAt" TIMESTAMP(3),
    "lastExportBytes" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "discipline" TEXT,
    "isFreelance" BOOLEAN NOT NULL DEFAULT false,
    "canPublish" BOOLEAN NOT NULL DEFAULT true,
    "canSeeFinance" BOOLEAN NOT NULL DEFAULT true,
    "scopedClientIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scopedProjectIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weeklyCapacityHours" INTEGER NOT NULL DEFAULT 40,
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brandColor" TEXT NOT NULL DEFAULT '#525252',
    "vertical" "Vertical" NOT NULL,
    "stage" "ClientStage" NOT NULL DEFAULT 'ONBOARDING',
    "accountLeadId" TEXT,
    "driveFolderPath" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "gstin" TEXT,
    "taxRatePercent" INTEGER NOT NULL DEFAULT 18,
    "paymentRemindersEnabled" BOOLEAN NOT NULL DEFAULT false,
    "healthFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "crmDealId" TEXT,
    "lastPortalActivity" TIMESTAMP(3),
    "portalSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jobTitle" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" "ContactRole" NOT NULL DEFAULT 'COLLABORATOR',
    "notifyChannel" TEXT NOT NULL DEFAULT 'email',
    "notifyCadence" TEXT NOT NULL DEFAULT 'weekly',
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalTemplate" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "vertical" "Vertical" NOT NULL,
    "isShipped" BOOLEAN NOT NULL DEFAULT false,
    "workUnit" TEXT NOT NULL,
    "timelineLabel" TEXT NOT NULL,
    "savedFromClientId" TEXT,
    "expectedTools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateModule" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "key" "ModuleKey" NOT NULL,
    "label" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "roles" "ContactRole"[] DEFAULT ARRAY[]::"ContactRole"[],

    CONSTRAINT "TemplateModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalConfig" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "templateId" TEXT,
    "slug" TEXT NOT NULL,
    "accentHex" TEXT,
    "logoAsset" TEXT,
    "emailSender" TEXT,
    "whiteLabel" BOOLEAN NOT NULL DEFAULT false,
    "homeLayout" TEXT NOT NULL DEFAULT 'auto',
    "showCreatorFees" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalModule" (
    "id" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "key" "ModuleKey" NOT NULL,
    "label" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "roles" "ContactRole"[] DEFAULT ARRAY[]::"ContactRole"[],

    CONSTRAINT "PortalModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProjectType" NOT NULL DEFAULT 'PROJECT',
    "status" "ProjectStatus" NOT NULL DEFAULT 'ON_TRACK',
    "ownerId" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "visibility" "Visibility" NOT NULL DEFAULT 'INTERNAL',
    "revisionRoundsAllowed" INTEGER,
    "revisionRoundsUsed" INTEGER NOT NULL DEFAULT 0,
    "driveFolderPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "MilestoneState" NOT NULL DEFAULT 'UPCOMING',
    "order" INTEGER NOT NULL,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "state" "MilestoneState" NOT NULL DEFAULT 'UPCOMING',
    "visibility" "Visibility" NOT NULL DEFAULT 'INTERNAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "milestoneId" TEXT,
    "name" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "ownerId" TEXT,
    "dueDate" TIMESTAMP(3),
    "estimateHours" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "Visibility" NOT NULL DEFAULT 'INTERNAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriveFile" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" BIGINT,
    "modifiedAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3),
    "uploadedByContactId" TEXT,
    "versionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriveFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deliverable" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "previewKind" "PreviewKind" NOT NULL DEFAULT 'DOCUMENT',
    "status" "DeliverableStatus" NOT NULL DEFAULT 'DRAFT',
    "assetSummary" TEXT,
    "ownerId" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'INTERNAL',
    "publishedAt" TIMESTAMP(3),
    "publishedByName" TEXT,
    "publishedVersion" TEXT,
    "driveFolderPath" TEXT,
    "figmaFileKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deliverable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliverableVersion" (
    "id" TEXT NOT NULL,
    "deliverableId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "note" TEXT,
    "authorId" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliverableVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalRequest" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "state" "ApprovalState" NOT NULL DEFAULT 'WAITING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "reminderCount" INTEGER NOT NULL DEFAULT 0,
    "lastRemindedAt" TIMESTAMP(3),
    "escalatedAt" TIMESTAMP(3),
    "escalatedToName" TEXT,

    CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalRecord" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "decision" "ApprovalDecision" NOT NULL,
    "channel" "Channel" NOT NULL DEFAULT 'PORTAL',
    "comment" TEXT,
    "recordedByName" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Update" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorId" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'INTERNAL',
    "visibleTo" "ContactRole"[] DEFAULT ARRAY[]::"ContactRole"[],
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Update_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "milestoneId" TEXT,
    "deliverableId" TEXT,
    "versionId" TEXT,
    "updateId" TEXT,
    "parentId" TEXT,
    "body" TEXT NOT NULL,
    "authorMemberId" TEXT,
    "authorContactId" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'INTERNAL',
    "pinX" DOUBLE PRECISION,
    "pinY" DOUBLE PRECISION,
    "pinPage" INTEGER,
    "pinTimecode" INTEGER,
    "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "ContractKind" NOT NULL DEFAULT 'RETAINER',
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "parties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "annualValue" DECIMAL(14,2),
    "monthlyValue" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "termStart" TIMESTAMP(3),
    "termEnd" TIMESTAMP(3),
    "renewalDate" TIMESTAMP(3),
    "alertsFired" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
    "signedAt" TIMESTAMP(3),
    "esignProvider" TEXT,
    "esignEnvelopeId" TEXT,
    "driveFilePath" TEXT,
    "governsProjectId" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'INTERNAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'OPEN',
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "paymentRail" "PaymentRail",
    "paymentLink" TEXT,
    "viewedAt" TIMESTAMP(3),
    "externalId" TEXT,
    "externalSource" TEXT,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "drivePath" TEXT,
    "sizeBytes" BIGINT,
    "visibility" "Visibility" NOT NULL DEFAULT 'INTERNAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "stage" "DealStage" NOT NULL DEFAULT 'PROPOSAL',
    "value" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "cadence" TEXT,
    "closeDate" TIMESTAMP(3),
    "wonAt" TIMESTAMP(3),
    "ownerName" TEXT,
    "note" TEXT,
    "contacts" JSONB,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RosterMember" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "realName" TEXT NOT NULL,
    "avatarColor" TEXT NOT NULL DEFAULT '#525252',
    "channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "followers" INTEGER,
    "status" "RosterStatus" NOT NULL DEFAULT 'BRIEFED',
    "postingDate" TIMESTAMP(3),
    "deliverableSummary" TEXT,
    "feeAmount" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RosterMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RosterPost" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3),
    "reach" INTEGER,
    "engagement" DOUBLE PRECISION,
    "likes" INTEGER,
    "saves" INTEGER,
    "source" TEXT,
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "RosterPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardWidget" (
    "id" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "source" TEXT,
    "config" JSONB NOT NULL,
    "span" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL,
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "DashboardWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "state" "ReportState" NOT NULL DEFAULT 'DRAFT',
    "sourceActivityCount" INTEGER NOT NULL DEFAULT 0,
    "sourceNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "permanentSlug" TEXT,
    "publishedAt" TIMESTAMP(3),
    "scheduleEnabled" BOOLEAN NOT NULL DEFAULT false,
    "scheduleCadence" TEXT,
    "scheduleDraftFirst" BOOLEAN NOT NULL DEFAULT true,
    "recipientContactIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportSection" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "body" TEXT,
    "provenance" TEXT,
    "metrics" JSONB,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ReportSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "category" "IntegrationCategory" NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'NOT_CONNECTED',
    "account" TEXT,
    "purpose" TEXT,
    "syncedAt" TIMESTAMP(3),
    "errorReason" TEXT,
    "blastRadius" TEXT,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingChecklist" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "templateName" TEXT,
    "sourceDealId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingStep" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "detail" TEXT,
    "ownerName" TEXT,
    "state" "StepState" NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "actionLabel" TEXT,
    "actionHref" TEXT,
    "automatic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OnboardingStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeForm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "clientId" TEXT,
    "sentToContactId" TEXT,
    "sentAt" TIMESTAMP(3),
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntakeForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeField" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "IntakeFieldType" NOT NULL DEFAULT 'TEXT',
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mapsTo" TEXT,
    "order" INTEGER NOT NULL,
    "answer" TEXT,

    CONSTRAINT "IntakeField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientRequest" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "neededBy" TIMESTAMP(3),
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "raisedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "heldAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "actionItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recordingUrl" TEXT,
    "source" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'INTERNAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "caption" TEXT,
    "category" TEXT,
    "preview" JSONB,
    "drivePath" TEXT,
    "syncedAt" TIMESTAMP(3),
    "visibility" "Visibility" NOT NULL DEFAULT 'CLIENT_VISIBLE',

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagicLink" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MagicLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "clientId" TEXT,
    "actorMemberId" TEXT,
    "actorName" TEXT NOT NULL,
    "actorIsClient" BOOLEAN NOT NULL DEFAULT false,
    "verb" TEXT NOT NULL,
    "objectType" TEXT NOT NULL,
    "objectId" TEXT,
    "objectName" TEXT,
    "detail" TEXT,
    "source" "ActivitySource" NOT NULL DEFAULT 'SYSTEM',
    "visibility" "Visibility",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Agency_slug_key" ON "Agency"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Agency_portalDomain_key" ON "Agency"("portalDomain");

-- CreateIndex
CREATE INDEX "Agency_slug_idx" ON "Agency"("slug");

-- CreateIndex
CREATE INDEX "Member_agencyId_idx" ON "Member"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_agencyId_email_key" ON "Member"("agencyId", "email");

-- CreateIndex
CREATE INDEX "Client_agencyId_stage_idx" ON "Client"("agencyId", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "Client_agencyId_slug_key" ON "Client"("agencyId", "slug");

-- CreateIndex
CREATE INDEX "Contact_clientId_role_idx" ON "Contact"("clientId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_clientId_email_key" ON "Contact"("clientId", "email");

-- CreateIndex
CREATE INDEX "PortalTemplate_agencyId_idx" ON "PortalTemplate"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateModule_templateId_key_key" ON "TemplateModule"("templateId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "PortalConfig_clientId_key" ON "PortalConfig"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "PortalConfig_slug_key" ON "PortalConfig"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PortalModule_portalId_key_key" ON "PortalModule"("portalId", "key");

-- CreateIndex
CREATE INDEX "Project_clientId_status_idx" ON "Project"("clientId", "status");

-- CreateIndex
CREATE INDEX "Phase_projectId_idx" ON "Phase"("projectId");

-- CreateIndex
CREATE INDEX "Milestone_projectId_date_idx" ON "Milestone"("projectId", "date");

-- CreateIndex
CREATE INDEX "Task_projectId_milestoneId_idx" ON "Task"("projectId", "milestoneId");

-- CreateIndex
CREATE INDEX "DriveFile_clientId_path_idx" ON "DriveFile"("clientId", "path");

-- CreateIndex
CREATE INDEX "Deliverable_clientId_status_idx" ON "Deliverable"("clientId", "status");

-- CreateIndex
CREATE INDEX "Deliverable_projectId_idx" ON "Deliverable"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliverableVersion_deliverableId_label_key" ON "DeliverableVersion"("deliverableId", "label");

-- CreateIndex
CREATE INDEX "ApprovalRequest_approverId_state_idx" ON "ApprovalRequest"("approverId", "state");

-- CreateIndex
CREATE INDEX "ApprovalRequest_state_dueAt_idx" ON "ApprovalRequest"("state", "dueAt");

-- CreateIndex
CREATE INDEX "ApprovalRecord_versionId_decidedAt_idx" ON "ApprovalRecord"("versionId", "decidedAt");

-- CreateIndex
CREATE INDEX "Update_projectId_createdAt_idx" ON "Update"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_deliverableId_idx" ON "Comment"("deliverableId");

-- CreateIndex
CREATE INDEX "Comment_projectId_idx" ON "Comment"("projectId");

-- CreateIndex
CREATE INDEX "Contract_clientId_status_idx" ON "Contract"("clientId", "status");

-- CreateIndex
CREATE INDEX "Contract_renewalDate_idx" ON "Contract"("renewalDate");

-- CreateIndex
CREATE INDEX "Invoice_clientId_status_idx" ON "Invoice"("clientId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_clientId_number_key" ON "Invoice"("clientId", "number");

-- CreateIndex
CREATE INDEX "Document_clientId_category_idx" ON "Document"("clientId", "category");

-- CreateIndex
CREATE INDEX "Deal_agencyId_stage_idx" ON "Deal"("agencyId", "stage");

-- CreateIndex
CREATE INDEX "RosterMember_clientId_idx" ON "RosterMember"("clientId");

-- CreateIndex
CREATE INDEX "RosterPost_memberId_idx" ON "RosterPost"("memberId");

-- CreateIndex
CREATE INDEX "DashboardWidget_portalId_idx" ON "DashboardWidget"("portalId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_permanentSlug_key" ON "Report"("permanentSlug");

-- CreateIndex
CREATE UNIQUE INDEX "Report_clientId_period_key" ON "Report"("clientId", "period");

-- CreateIndex
CREATE INDEX "Integration_agencyId_category_idx" ON "Integration"("agencyId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_agencyId_provider_key" ON "Integration"("agencyId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingChecklist_clientId_key" ON "OnboardingChecklist"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "IntakeForm_token_key" ON "IntakeForm"("token");

-- CreateIndex
CREATE INDEX "ClientRequest_clientId_status_idx" ON "ClientRequest"("clientId", "status");

-- CreateIndex
CREATE INDEX "Meeting_clientId_heldAt_idx" ON "Meeting"("clientId", "heldAt");

-- CreateIndex
CREATE INDEX "Asset_clientId_idx" ON "Asset"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "MagicLink_token_key" ON "MagicLink"("token");

-- CreateIndex
CREATE INDEX "MagicLink_contactId_idx" ON "MagicLink"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "PortalSession_token_key" ON "PortalSession"("token");

-- CreateIndex
CREATE INDEX "PortalSession_contactId_idx" ON "PortalSession"("contactId");

-- CreateIndex
CREATE INDEX "ActivityLog_clientId_createdAt_idx" ON "ActivityLog"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_agencyId_createdAt_idx" ON "ActivityLog"("agencyId", "createdAt");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_accountLeadId_fkey" FOREIGN KEY ("accountLeadId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalTemplate" ADD CONSTRAINT "PortalTemplate_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateModule" ADD CONSTRAINT "TemplateModule_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PortalTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalConfig" ADD CONSTRAINT "PortalConfig_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalConfig" ADD CONSTRAINT "PortalConfig_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PortalTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalModule" ADD CONSTRAINT "PortalModule_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "PortalConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriveFile" ADD CONSTRAINT "DriveFile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriveFile" ADD CONSTRAINT "DriveFile_uploadedByContactId_fkey" FOREIGN KEY ("uploadedByContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriveFile" ADD CONSTRAINT "DriveFile_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "DeliverableVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverableVersion" ADD CONSTRAINT "DeliverableVersion_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverableVersion" ADD CONSTRAINT "DeliverableVersion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "DeliverableVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRecord" ADD CONSTRAINT "ApprovalRecord_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "DeliverableVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRecord" ADD CONSTRAINT "ApprovalRecord_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Update" ADD CONSTRAINT "Update_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Update" ADD CONSTRAINT "Update_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "DeliverableVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "Update"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorMemberId_fkey" FOREIGN KEY ("authorMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorContactId_fkey" FOREIGN KEY ("authorContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterMember" ADD CONSTRAINT "RosterMember_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterPost" ADD CONSTRAINT "RosterPost_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "RosterMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardWidget" ADD CONSTRAINT "DashboardWidget_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "PortalConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportSection" ADD CONSTRAINT "ReportSection_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChecklist" ADD CONSTRAINT "OnboardingChecklist_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingStep" ADD CONSTRAINT "OnboardingStep_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "OnboardingChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeField" ADD CONSTRAINT "IntakeField_formId_fkey" FOREIGN KEY ("formId") REFERENCES "IntakeForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRequest" ADD CONSTRAINT "ClientRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRequest" ADD CONSTRAINT "ClientRequest_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagicLink" ADD CONSTRAINT "MagicLink_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalSession" ADD CONSTRAINT "PortalSession_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_actorMemberId_fkey" FOREIGN KEY ("actorMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
