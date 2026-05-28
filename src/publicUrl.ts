/** GitHub Pages 子路径（如 /Frankenstein-Slot/）；本地开发为 / */
export function getAppBase(): string {
  let base = import.meta.env.BASE_URL || "/";
  if (base !== "/") {
    return base.endsWith("/") ? base : `${base}/`;
  }

  const seg = location.pathname.split("/").filter(Boolean)[0];
  if (seg && !/\.[a-z0-9]+$/i.test(seg)) {
    return `/${seg}/`;
  }
  return "/";
}

/** public/ 目录资源 */
export function publicUrl(path: string): string {
  const clean = path.replace(/^\//, "");
  return `${getAppBase()}${clean}`;
}
