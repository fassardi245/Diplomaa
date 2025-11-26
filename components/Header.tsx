import Link from "next/link";
import React from "react";
import { ClerkLoaded, SignedIn, UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import Container from "./Container";
import { getAllCategories, getMyOrders } from "@/sanity/helpers";
import HeaderMenu from "./new/HeaderMenu";
import Logo from "./new/Logo";
import { ListOrdered, ShieldCheck } from "lucide-react"; // Importé un ícono para el admin
import CartIcon from "./new/CartIcon";
import MobileMenu from "./new/MobileMenu";
import SearchBar from "./new/SearchBar";
// IMPORTANTE: Importamos tu fábrica de seguridad
import { obtenerUsuarioSeguridad } from "@/sanity/lib/securityFactory";

const Header = async () => {
  const user = await currentUser();
  const { userId } = await auth();

  // 1. Lógica de Órdenes (Existente)
  let orders = null;
  if (userId) {
    orders = await getMyOrders(userId);
  }
  const categories = await getAllCategories(3);

  // 2. NUEVA LÓGICA: Verificar si es Admin
  let esAdmin = false;
  if (user) {
    // Consultamos a Sanity usando tu Clerk ID y Email
    const seguridad = await obtenerUsuarioSeguridad(
      user.id,
      user.emailAddresses[0]?.emailAddress
    );
    
    // Preguntamos al Patrón Composite si tiene la "Llave Maestra"
    // Asegúrate de haber creado la acción "acceso_admin_panel" en Sanity
    esAdmin = seguridad.puedo("acceso_admin_panel");
  }

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-b-gray-200 py-5">
      <Container className="flex items-center justify-between gap-7 text-lightColor">
        <HeaderMenu categories={categories} />
        
        <div className="w-auto md:w-1/3 flex items-center justify-center gap-2.5">
          <MobileMenu categories={categories} />
          <Logo>SMARTCLOTH</Logo>
        </div>

        <div className="w-auto md:w-1/3 flex items-center justify-end gap-5">
          <SearchBar />
          
          {/* --- BOTÓN ADMIN (Solo visible si tiene permisos) --- */}
          {esAdmin && (
            <Link 
              href="/admin" 
              className="hidden md:flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-gray-800 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </Link>
          )}
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