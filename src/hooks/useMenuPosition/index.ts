import { useEffect, useState } from "react";
import type { CSSProperties, RefObject } from "react";

const APPROX_ITEM_HEIGHT = 40;
const APPROX_PADDING = 16;
const MENU_WIDTH = 220;
const MENU_GAP = 4;

export function useMenuPosition(
  triggerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  isMobile: boolean,
  actionsLength: number,
): CSSProperties {
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  useEffect(() => {
    if (!isOpen || isMobile || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const approxHeight = actionsLength * APPROX_ITEM_HEIGHT + APPROX_PADDING;
    const openUpward = rect.bottom + approxHeight > window.innerHeight;
    const openLeft = rect.left + MENU_WIDTH > window.innerWidth;

    setMenuStyle({
      top: openUpward ? undefined : rect.bottom + MENU_GAP,
      bottom: openUpward ? window.innerHeight - rect.top + MENU_GAP : undefined,
      left: openLeft ? undefined : rect.left,
      right: openLeft ? window.innerWidth - rect.right : undefined,
    });
  }, [isOpen, isMobile, actionsLength, triggerRef]);

  return menuStyle;
}
