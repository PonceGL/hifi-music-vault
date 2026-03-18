import { useState, type PropsWithChildren } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Menu } from 'lucide-react';

export function Layout({ children }: PropsWithChildren) {
    const [openMovile, setOpenMovile] = useState<boolean>(false);

    return (
        <>
            <header className="border-b">
                <div className="container flex justify-between items-center mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold">HiFi Music Vault</h1>
                    <button className="md:hidden" onClick={() => setOpenMovile(!openMovile)}>
                        <Menu />
                    </button>
                </div>
            </header>
            <div className="w-full flex justify-between items-start">
                <Sidebar isOpen={openMovile} setOpen={setOpenMovile} />
                {children}
            </div>
            <footer className="border-t">
                <div className="container mx-auto px-4 py-4 text-center text-muted-foreground">
                    <p>© 2026 HiFi Music Vault. All rights reserved.</p>
                </div>
            </footer>
        </>
    )
}