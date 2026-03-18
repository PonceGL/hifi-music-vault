import { NavigationLinks } from "@/components/layout/NavigationLinks";
import { useNavigation } from "@/hooks/useNavigation";


export function Sidebar() {
    const { isOpen } = useNavigation();

    if (!isOpen) return null;

    return (
        <aside className="w-64 shrink-0 border-r border-gray-200 bg-gray-50 h-full overflow-y-auto hidden md:block">
            <div className="p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-6 px-2">Mi Música</h2>
                <NavigationLinks layout="vertical" />
            </div>
        </aside>
    );
}