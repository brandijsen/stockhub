import path from "path";

import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { PrismaClient, UserRole } from "@prisma/client";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
  override: true,
});

const prisma = new PrismaClient();

function seedAdminNames(): { firstName: string; lastName: string } {
  const first = process.env.SEED_SUPERADMIN_FIRST_NAME?.trim();
  const last = process.env.SEED_SUPERADMIN_LAST_NAME?.trim();
  const legacy = process.env.SEED_SUPERADMIN_NAME?.trim();
  if (first && last) {
    return { firstName: first, lastName: last };
  }
  if (legacy) {
    const sp = legacy.indexOf(" ");
    if (sp > 0) {
      return {
        firstName: legacy.slice(0, sp).trim(),
        lastName: legacy.slice(sp + 1).trim() || legacy.slice(0, sp).trim(),
      };
    }
    return { firstName: legacy, lastName: legacy };
  }
  return { firstName: "Super", lastName: "Admin" };
}

async function main() {
  const email = process.env.SEED_SUPERADMIN_EMAIL;
  const password = process.env.SEED_SUPERADMIN_PASSWORD;
  const { firstName, lastName } = seedAdminNames();

  if (!email?.trim() || !password) {
    throw new Error(
      "Set SEED_SUPERADMIN_EMAIL and SEED_SUPERADMIN_PASSWORD in the repo root .env",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email: email.trim().toLowerCase() },
    update: {
      firstName,
      lastName,
      role: UserRole.SUPERADMIN,
      password: passwordHash,
      emailVerified: new Date(),
    },
    create: {
      email: email.trim().toLowerCase(),
      firstName,
      lastName,
      role: UserRole.SUPERADMIN,
      password: passwordHash,
      emailVerified: new Date(),
    },
  });

  console.log(`Super admin ready: ${email.trim().toLowerCase()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
