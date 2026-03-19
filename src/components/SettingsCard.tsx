import type { PropsWithChildren } from "react";
import { Card } from "@/components/ui/card";

interface SettingsCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

export function SettingsCard({ title, description, icon, children }: PropsWithChildren<SettingsCardProps>) {
    return (
        <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-bold leading-none">{title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
            </div>
            <div className="mt-2">{children}</div>
        </Card>
    );
}