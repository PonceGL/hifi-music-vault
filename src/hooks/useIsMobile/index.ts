import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 640;

export function useIsMobile(breakpoint = MOBILE_BREAKPOINT): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = (): void => setIsMobile(window.innerWidth < breakpoint);

    // Initial check
    check();

    window.addEventListener("resize", check);
    return (): void => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}
