export function isPublishedAnnouncement(
  row: { isActive: boolean; publishedAt: Date; expiresAt: Date | null },
  asOf: Date,
): boolean {
  if (!row.isActive) {
    return false;
  }
  if (row.publishedAt.getTime() > asOf.getTime()) {
    return false;
  }
  if (row.expiresAt !== null && row.expiresAt.getTime() <= asOf.getTime()) {
    return false;
  }
  return true;
}
