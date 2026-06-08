import { Prisma } from "@prisma/client";

export function isPrismaUniqueViolation(
  error: unknown,
  target?: string,
): boolean {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    if (!target) {
      return true;
    }
    const fields = error.meta?.target;
    if (Array.isArray(fields)) {
      return fields.includes(target);
    }
    return String(fields).includes(target);
  }
  return false;
}

export function isPrismaForeignKeyViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  );
}
