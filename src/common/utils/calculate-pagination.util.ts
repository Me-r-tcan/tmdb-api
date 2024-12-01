export function calculatePagination(
  page: number = 1,
  limit: number = 10,
): { skip: number; limit: number } {
  const sanitizedPage = Math.max(1, page);
  const sanitizedLimit = Math.max(1, limit);

  const skip = (sanitizedPage - 1) * sanitizedLimit;

  return { skip, limit: sanitizedLimit };
}
