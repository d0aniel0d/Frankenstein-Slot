/** public/ 目录资源；兼容 GitHub Pages 子路径（如 /Frankenstein-Slot/）。 */
export function publicUrl(path: string): string {
  const clean = path.replace(/^\//, "");
  return `${import.meta.env.BASE_URL}${clean}`;
}
