import { NavLink } from 'react-router-dom';

// Definimos nuestra lista de rutas una sola vez
const NAV_ITEMS = [
    { name: 'Library', path: '/' },
    { name: 'Playlists', path: '/playlists' },
    { name: 'Setup', path: '/setup' },
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
                        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                            ? 'bg-gray-200 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`
                    }
                >
                    {item.name}
                </NavLink>
            ))}
        </nav>
    );
}