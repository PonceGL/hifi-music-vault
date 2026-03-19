import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface ThemeToggleItemProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onChange: (checked: boolean) => void;
}

export function ThemeToggleItem({ icon, label, active, onChange }: ThemeToggleItemProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {icon}
                <Label className="text-base font-medium cursor-pointer">{label}</Label>
            </div>
            <Switch checked={active} onCheckedChange={onChange} />
        </div>
    );
}