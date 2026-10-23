-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "HttpMethod" AS ENUM ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS');

-- CreateEnum
CREATE TYPE "VersionStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ParameterLocation" AS ENUM ('PATH', 'QUERY', 'HEADER', 'COOKIE');

-- CreateEnum
CREATE TYPE "SchemaKind" AS ENUM ('REQUEST', 'RESPONSE');

-- CreateEnum
CREATE TYPE "ChangeSeverity" AS ENUM ('NON_BREAKING', 'POTENTIALLY_BREAKING', 'BREAKING');

-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('ENDPOINT_ADDED', 'ENDPOINT_REMOVED', 'METHOD_CHANGED', 'PARAMETER_ADDED', 'PARAMETER_REMOVED', 'REQUIRED_CHANGED', 'FIELD_ADDED', 'FIELD_REMOVED', 'TYPE_CHANGED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apis" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "baseUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_versions" (
    "id" TEXT NOT NULL,
    "apiId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" "VersionStatus" NOT NULL DEFAULT 'DRAFT',
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "source" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "api_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_endpoints" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "method" "HttpMethod" NOT NULL,
    "path" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "deprecated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_parameters" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" "ParameterLocation" NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "example" TEXT,

    CONSTRAINT "api_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_schemas" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "kind" "SchemaKind" NOT NULL,
    "name" TEXT NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'application/json',
    "statusCode" INTEGER,
    "schema" JSONB NOT NULL,

    CONSTRAINT "api_schemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_examples" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "request" JSONB,
    "response" JSONB,
    "statusCode" INTEGER,

    CONSTRAINT "api_examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_changes" (
    "id" TEXT NOT NULL,
    "fromVersionId" TEXT NOT NULL,
    "toVersionId" TEXT NOT NULL,
    "changeType" "ChangeType" NOT NULL,
    "severity" "ChangeSeverity" NOT NULL,
    "summary" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_changelogs" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_changelogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_workspaceId_userId_key" ON "workspace_members"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "api_versions_apiId_version_key" ON "api_versions"("apiId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "api_endpoints_versionId_method_path_key" ON "api_endpoints"("versionId", "method", "path");

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apis" ADD CONSTRAINT "apis_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_versions" ADD CONSTRAINT "api_versions_apiId_fkey" FOREIGN KEY ("apiId") REFERENCES "apis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_endpoints" ADD CONSTRAINT "api_endpoints_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "api_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_parameters" ADD CONSTRAINT "api_parameters_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "api_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_schemas" ADD CONSTRAINT "api_schemas_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "api_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_examples" ADD CONSTRAINT "api_examples_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "api_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_changes" ADD CONSTRAINT "api_changes_fromVersionId_fkey" FOREIGN KEY ("fromVersionId") REFERENCES "api_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_changes" ADD CONSTRAINT "api_changes_toVersionId_fkey" FOREIGN KEY ("toVersionId") REFERENCES "api_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_changelogs" ADD CONSTRAINT "api_changelogs_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "api_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
