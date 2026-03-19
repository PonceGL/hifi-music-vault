import { NavLink } from 'react-router-dom';
import { Library, ListMusic, Settings } from "lucide-react";

// Definimos nuestra lista de rutas una sola vez
const NAV_ITEMS = [
    { name: "Biblioteca", path: "/", icon: Library },
    { name: "Playlists", path: "/playlists", icon: ListMusic },
    { name: "Ajustes", path: "/settings", icon: Settings },
];

interface NavigationLinksProps {
    layout?: 'vertical' | 'horizontal';
    onItemClick?: () => void;
}

export function NavigationLinks({ layout = 'vertical', onItemClick }: NavigationLinksProps) {
    const isVertical = layout === 'vertical';

    return (
        <nav className={`flex ${isVertical ? 'flex-col space-y-1' : 'flex-row space-x-2'}`}>
            {NAV_ITEMS.map((item) => (
                <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onItemClick}
                    className={({ isActive }) =>
                        `flex justify-start items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                        }`
                    }
                >
                    <item.icon className="w-5 h-5 mr-2" />
                    {item.name}
                </NavLink>
            ))}
        </nav>
    );
}