/**
 * Generic pagination helper function
 * @param array - Array to paginate
 * @param pageSize - Number of items per page
 * @param pageNumber - Current page number (1-based)
 * @returns Slice of array for the current page
 */
export function paginate<T>(array: T[], pageSize: number, pageNumber: number): T[] {
  // pageNumber is 1-based
  const start = (pageNumber - 1) * pageSize;
  return array.slice(start, start + pageSize);
}
