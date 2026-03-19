import { useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import { TITLE_ID } from "@/components/layout/TopBar";

interface TitleBarProps {
    title: string;
}

export function TitleBar({ title }: TitleBarProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    const targetNode = document.getElementById(TITLE_ID);
    if (!targetNode) return null;
    if (!title) return null;

    const titleComponent = (
        <div className="flex items-center justify-between">
            <h1 className="max-w-28 text-2xl font-bold line-clamp-1 whitespace-nowrap overflow-hidden text-ellipsis md:max-w-60">{title}</h1>
        </div>
    );

    return createPortal(titleComponent, targetNode);

}