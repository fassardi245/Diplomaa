import Link from "next/link";
import Logo from "./new/Logo";
import FooterTop from "./new/FooterTop";
import SocialMedia from "./new/SocialMedia";
import { categoriesData, quickLinksData } from "@/constants";

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Sección superior con información de contacto */}
        <FooterTop />

        {/* Contenido principal del pie de página */}
        <div className="py-12 flex flex-col items-center text-center space-y-10">
          {/* Logo + descripción + redes */}
          <div className="space-y-4 max-w-md">
            <Logo>Smartcloth</Logo>
            <p className="text-gray-600 text-sm">
              Descubrí las colecciones de indumentaria de Smartcloth, que combinan estilo,
              comodidad y diseño para acompañarte todos los días.
            </p>
          </div>

          {/* Enlaces rápidos y categorías centrados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Enlaces rápidos</h3>
              <ul className="space-y-3">
                {quickLinksData?.map((item) => (
                  <li key={item?.title}>
                    <Link
                      href={item?.href}
                      className="text-gray-600 hover:text-gray-900 text-sm font-medium hoverEffect"
                    >
                      {item?.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Categorías</h3>
              <ul className="space-y-3">
                {categoriesData.map((item) => (
                  <li key={item?.title}>
                    <Link
                      href={`/category${item?.href}`}
                      className="text-gray-600 hover:text-gray-900 text-sm font-medium hoverEffect"
                    >
                      {item?.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sección inferior de derechos de autor */}
        <div className="py-6 border-t text-center text-sm text-gray-600">
          <p>
            © {new Date().getFullYear()} Smartcloth. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
