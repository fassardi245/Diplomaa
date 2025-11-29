"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Definimos la interfaz localmente para evitar el error de importación de sanity.types
interface CategoryProps {
  _id: string;
  title?: string;
  slug?: {
    current: string;
  };
}

const HeaderMenu = ({ categories }: { categories: CategoryProps[] }) => {
  const pathname = usePathname();

  return (
    // hidden xl:inline-flex -> Esto asegura que este menú de texto
    // SOLO aparezca cuando la pantalla es lo suficientemente grande (XL),
    // evitando que se superponga con el logo en laptops.
    <div className="hidden xl:inline-flex w-full items-center gap-5 text-sm capitalize font-semibold text-lightColor">
      
      {/* HOME */}
      <Link
        href={"/"}
        className={`hover:text-darkColor hoverEffect relative group ${pathname === "/" && "text-darkColor"}`}
      >
        Home
        <span className={`absolute -bottom-0.5 left-1/2 w-0 h-0.5 bg-darkColor transition-all duration-300 group-hover:w-1/2 group-hover:left-0 ${pathname === "/" && "w-1/2"}`} />
        <span className={`absolute -bottom-0.5 right-1/2 w-0 h-0.5 bg-darkColor transition-all duration-300 group-hover:w-1/2 group-hover:right-0 ${pathname === "/" && "w-1/2"}`} />
      </Link>

      {/* CATEGORÍAS */}
      {categories?.map((category) => (
        <Link
          key={category?._id}
          href={`/category/${category?.slug?.current}`}
          className={`hover:text-darkColor hoverEffect relative group ${
            pathname === `/category/${category?.slug?.current}` && "text-darkColor"
          }`}
        >
          {category?.title}
          <span className={`absolute -bottom-0.5 left-1/2 w-0 h-0.5 bg-darkColor transition-all duration-300 group-hover:w-1/2 group-hover:left-0 ${
              pathname === `/category/${category?.slug?.current}` && "w-1/2"
            }`}
          />
          <span className={`absolute -bottom-0.5 right-1/2 w-0 h-0.5 bg-darkColor transition-all duration-300 group-hover:w-1/2 group-hover:right-0 ${
              pathname === `/category/${category?.slug?.current}` && "w-1/2"
            }`}
          />
        </Link>
      ))}

      {/* SHOP */}
      <Link
        href={"/shop"}
        className={`hover:text-darkColor hoverEffect relative group ${pathname === "/shop" && "text-darkColor"}`}
      >
        Shop
        <span className={`absolute -bottom-0.5 left-1/2 w-0 h-0.5 bg-darkColor transition-all duration-300 group-hover:w-1/2 group-hover:left-0 ${pathname === "/shop" && "w-1/2"}`} />
        <span className={`absolute -bottom-0.5 right-1/2 w-0 h-0.5 bg-darkColor transition-all duration-300 group-hover:w-1/2 group-hover:right-0 ${pathname === "/shop" && "w-1/2"}`} />
      </Link>
    </div>
  );
};

export default HeaderMenu;