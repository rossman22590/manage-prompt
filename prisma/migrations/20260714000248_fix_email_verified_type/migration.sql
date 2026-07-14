-- AlterTable
-- Convert emailVerified from a nullable timestamp (leftover from a prior
-- auth library's convention) to a real boolean, matching how every existing
-- call site already treats it (Boolean(user.emailVerified), ternary checks)
-- and what better-auth's core user-creation flow expects. A non-null
-- timestamp meant "verified", so it maps to true; null maps to false —
-- no verification status is lost in the conversion.
ALTER TABLE "User"
  ALTER COLUMN "emailVerified" DROP DEFAULT,
  ALTER COLUMN "emailVerified" TYPE BOOLEAN USING ("emailVerified" IS NOT NULL),
  ALTER COLUMN "emailVerified" SET DEFAULT false,
  ALTER COLUMN "emailVerified" SET NOT NULL;
