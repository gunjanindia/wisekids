import prisma from "@/lib/prisma";

export async function createAuditLog({
  userId,
  action,
  entity,
  entityId,
  details,
  ipAddress = "127.0.0.1",
}: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, any> | string;
  ipAddress?: string;
}) {
  try {
    const detailsJson =
      typeof details === "string" ? details : details ? JSON.stringify(details) : null;

    return await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        detailsJson,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    return null;
  }
}
