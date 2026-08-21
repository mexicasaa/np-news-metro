// Fallback editorial SVG placeholder when external CDN is offline or blocked
export const DEFAULT_FALLBACK_IMAGE = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22500%22%20viewBox%3D%220%200%20800%20500%22%3E%3Crect%20fill%3D%22%23162839%22%20width%3D%22800%22%20height%3D%22500%22%2F%3E%3Crect%20fill%3D%22%232C3E50%22%20x%3D%2220%22%20y%3D%2220%22%20width%3D%22760%22%20height%3D%22460%22%20rx%3D%224%22%2F%3E%3Cpath%20d%3D%22M400%20180%20L420%20240%20L380%20240%20Z%22%20fill%3D%22%23C5A059%22%2F%3E%3Ctext%20fill%3D%22%23FFFFFF%22%20font-family%3D%22serif%22%20font-size%3D%2224%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%22290%22%20text-anchor%3D%22middle%22%3ENP%20NEWS%20METRO%3C%2Ftext%3E%3Ctext%20fill%3D%22%23C5A059%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20letter-spacing%3D%223%22%20x%3D%2250%25%22%20y%3D%22320%22%20text-anchor%3D%22middle%22%3EREAL%20NEWS.%20REAL%20IMPACT.%3C%2Ftext%3E%3C%2Fsvg%3E';

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  if (target.src !== DEFAULT_FALLBACK_IMAGE) {
    target.src = DEFAULT_FALLBACK_IMAGE;
  }
};
