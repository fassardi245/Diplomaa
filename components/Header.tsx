import Link from "next/link";
import React from "react";
import { ClerkLoaded, SignedIn, UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import Container from "./Container";
import { getAllCategories, getMyOrders } from "@/sanity/helpers";
import HeaderMenu from "./new/HeaderMenu";
import Logo from "./new/Logo";
import { ListOrdered, ShieldCheck } from "lucide-react"; // Quita 'Heart' de aquí porque ya no lo usas directo
import CartIcon from "./new/CartIcon";
import WishlistIcon from "./WishlistIcon"; // <--- 1. IMPÓRTALO AQUÍ
import MobileMenu from "./new/MobileMenu";
import SearchBar from "./new/SearchBar";
import { obtenerUsuarioSeguridad } from "@/sanity/lib/securityFactory";

const Header = async () => {
  const user = await currentUser();
  const { userId } = await auth();

  let orders = null;
  if (userId) {
    orders = await getMyOrders(userId);
  }

  const categories = await getAllCategories();

  let esAdmin = false;
  if (user) {
    const seguridad = await obtenerUsuarioSeguridad(
      user.id,
      user.emailAddresses[0]?.emailAddress
    );
    const roles = seguridad.nombreRol.split(",").map(r => r.trim());
    esAdmin = roles.includes("Admin");
  }

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-b-gray-200 py-5">
      <Container className="flex items-center justify-between gap-7 text-lightColor">
        
        {/* --- IZQUIERDA --- */}
        <div className="w-auto md:w-1/3 flex items-center justify-start gap-4">
           <HeaderMenu categories={categories} />
           <div className="xl:hidden">
              <MobileMenu categories={categories} />
           </div>
        </div>
        
        {/* --- CENTRO --- */}
        <div className="w-auto md:w-1/3 flex items-center justify-center">
          <Logo>SMARTCLOTH</Logo>
        </div>

        {/* --- DERECHA --- */}
        <div className="w-auto md:w-1/3 flex items-center justify-end gap-5">
          <SearchBar />
          
          {esAdmin && (
            <div 
              title="Modo Administrador Activo"
              className="hidden md:flex items-center gap-1.5 bg-gray-100 text-gray-800 border border-gray-200 px-3 py-1.5 rounded-full text-xs font-bold cursor-default select-none"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
              <span>Admin</span>
            </div>
          )}

          {/* 2. REEMPLAZA EL LINK VIEJO POR EL COMPONENTE NUEVO */}
          <WishlistIcon />
          {/* -------------------------------------------------- */}

          <CartIcon />
          
          <SignedIn>
            <Link href={"/orders"} className="group relative">
              <ListOrdered className="group-hover:text-darkColor hoverEffect" />
              <span className="absolute -top-1 -right-1 bg-darkColor text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center">
                {orders?.length ? orders?.length : 0}
              </span>
            </Link>
          </SignedIn>

          <ClerkLoaded>
            <SignedIn>
              <UserButton />
            </SignedIn>
            {!user && (
              <Link
                href="/sign-in"
                className="text-sm font-semibold hover:text-darkColor hoverEffect"
              >
                iniciar sesión
              </Link>
            )}
          </ClerkLoaded>
        </div>
      </Container>
    </header>
  );
};

export default Header;