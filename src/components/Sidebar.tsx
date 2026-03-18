import { Library, ListMusic, PanelLeft, Settings, X } from "lucide-react";

interface Props {
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setOpen }: Props) {

    const items = [
        { title: "Biblioteca", url: "/library", icon: Library },
        { title: "Playlists", url: "/playlists", icon: ListMusic },
        { title: "Ajustes", url: "/", icon: Settings },
    ];

    return (
        <aside className={`w-dvw h-dvh fixed bg-white top-0 
        ${isOpen ? "left-0" : "left-full"}
         md:relative md:top-auto md:left-auto md:w-full md:h-full md:border-r transition-all duration-300 ease-in-out`}>
            <div className={`flex ${isOpen ? "justify-between md:justify-end" : "justify-start"} items-center px-4 py-4 transition-all duration-300 ease-in-out`}>
                <h1 className="text-2xl font-bold md:hidden">HiFi Music Vault</h1>
                <button onClick={() => setOpen(!isOpen)}>
                    <X className="md:hidden" />
                    <PanelLeft className="hidden md:block" />
                </button>
            </div>
            <nav className={`${isOpen ? "p-4" : "p-0"} transition-all duration-300 ease-in-out overflow-hidden`}>
                <ul className="space-y-2">
                    {items.map((item) => (
                        <li key={item.url}>
                            <a href={item.url} className="flex items-center px-4 py-2 rounded hover:bg-gray-100">
                                <item.icon className="w-4 h-4 mr-2" />
                                <span className={`${isOpen ? "w-full" : "w-0"} transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap`}>
                                    {item.title}
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    )
}