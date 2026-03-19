import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface PathDisplayProps {
    path: string;
    onClear: () => void;
}

export function PathDisplay({ path, onClear }: PathDisplayProps) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/5 p-3 border border-secondary/10 group">
            <div className="flex flex-col overflow-hidden w-full gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary text-left">
                    Ruta Seleccionada
                </span>
                <code
                    className="font-mono text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ direction: 'rtl', textAlign: 'left' }}
                    title={path}
                >
                    {path}
                </code>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                className="rounded-full hover:bg-destructive/10 hover:text-destructive shrink-0 cursor-pointer"
            >
                <Trash2 size={18} />
            </Button>
        </div>
    );
}