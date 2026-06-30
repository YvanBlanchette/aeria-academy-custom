-- CreateTable
CREATE TABLE "UserDashboardSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "timezone" TEXT NOT NULL DEFAULT 'America/Toronto',
    "reminderHour" TEXT NOT NULL DEFAULT '09:00',
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT true,
    "courseReminders" BOOLEAN NOT NULL DEFAULT true,
    "productUpdates" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDashboardSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDashboardSettings_userId_key" ON "UserDashboardSettings"("userId");

-- CreateIndex
CREATE INDEX "UserDashboardSettings_userId_idx" ON "UserDashboardSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserDashboardSettings" ADD CONSTRAINT "UserDashboardSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
