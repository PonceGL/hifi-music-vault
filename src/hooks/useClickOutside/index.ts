import { useEffect } from "react";
import type { RefObject } from "react";

export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  isActive: boolean,
  onClickOutside: () => void,
): void {
  useEffect(() => {
    if (!isActive) return;

    const handleMouseDown = (e: MouseEvent): void => {
      const target = e.target as Node;
      const isOutside = refs.every(
        (ref) => ref.current && !ref.current.contains(target),
      );

      if (isOutside) {
        onClickOutside();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return (): void =>
      document.removeEventListener("mousedown", handleMouseDown);
  }, [refs, isActive, onClickOutside]);
}
