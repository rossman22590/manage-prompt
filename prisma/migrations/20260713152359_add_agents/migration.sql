-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "spendLimit" INTEGER;

-- CreateTable
CREATE TABLE "Agent" (
    "id" SERIAL NOT NULL,
    "shortId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "modelSettings" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "cacheControlTtl" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" SERIAL NOT NULL,
    "agentId" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "totalTokenCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stripe" (
    "id" SERIAL NOT NULL,
    "customerId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "subscription" JSONB,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stripe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_shortId_key" ON "Agent"("shortId");

-- CreateIndex
CREATE INDEX "Agent_ownerId_idx" ON "Agent"("ownerId");

-- CreateIndex
CREATE INDEX "AgentRun_agentId_idx" ON "AgentRun"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "Stripe_customerId_key" ON "Stripe"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Stripe_subscriptionId_key" ON "Stripe"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Stripe_ownerId_key" ON "Stripe"("ownerId");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stripe" ADD CONSTRAINT "Stripe_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
