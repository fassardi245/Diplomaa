"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce"; // Necesitarás instalar esto: npm i use-debounce

// Si no quieres instalar use-debounce, podemos hacerlo con un timeout simple,
// pero la librería es mejor para no saturar. Si prefieres sin libreria, avísame.
// Asumiré que lo hacemos con un timeout nativo para no obligarte a instalar nada.

export default function OrderSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    
    // Reemplaza la URL actual con la nueva búsqueda
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative hidden md:block">
      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input 
        type="text" 
        placeholder="Buscar por N° Orden..." 
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("query")?.toString()}
        className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 w-64 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
      />
    </div>
  );
}