-- CreateEnum
CREATE TYPE "CommunityNotificationType" AS ENUM ('POST_LIKE', 'POST_COMMENT');

-- CreateTable
CREATE TABLE "CommunityNotification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "type" "CommunityNotificationType" NOT NULL,
    "postId" TEXT,
    "commentId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunityNotification_recipientId_isRead_createdAt_idx" ON "CommunityNotification"("recipientId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityNotification_recipientId_createdAt_idx" ON "CommunityNotification"("recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityNotification_postId_idx" ON "CommunityNotification"("postId");

-- CreateIndex
CREATE INDEX "CommunityNotification_commentId_idx" ON "CommunityNotification"("commentId");

-- AddForeignKey
ALTER TABLE "CommunityNotification" ADD CONSTRAINT "CommunityNotification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityNotification" ADD CONSTRAINT "CommunityNotification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityNotification" ADD CONSTRAINT "CommunityNotification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityNotification" ADD CONSTRAINT "CommunityNotification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "CommunityComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
