"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce"; 

export default function OrderSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    // CAMBIO CLAVE: Quitamos "hidden" y "md:block". Ahora es siempre visible.
    // Agregué 'w-full max-w-sm' para que tenga buen tamaño.
    <div className="relative w-full max-w-sm">
      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input 
        type="text" 
        placeholder="Buscar por N° Orden..." 
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("query")?.toString()}
        className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
      />
    </div>
  );
}