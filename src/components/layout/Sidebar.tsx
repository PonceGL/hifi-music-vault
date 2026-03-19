import { NavigationLinks } from "@/components/layout/NavigationLinks";
import { useNavigation } from "@/hooks/useNavigation";


export function Sidebar() {
    const { isOpen } = useNavigation();

    // if (!isOpen) return null;

    return (
        <aside className={`${isOpen ? 'w-64' : 'w-0'} shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 h-full overflow-y-auto hidden md:block transition-all duration-300 ease-in-out`}>
            <div className="p-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 px-2">Mi Música</h2>
                <NavigationLinks layout="vertical" />
            </div>
        </aside>
    );
}