import Container from "@/components/Container";
import HomeBanner from "@/components/new/HomeBanner";
import ProductGrid from "@/components/ProductGrid";
// 1. Importas el botón mágico
import AdminAccessButton from "../../components/admin/AdminAccessButton";

export default function Home() {
  return (
    <Container className="py-10 relative"> 
      {/* Agregué 'relative' por seguridad, aunque el fixed funciona igual */}
      
      <HomeBanner />
      <ProductGrid />

      {/* 2. Lo colocas aquí al final. 
          Solo se renderizará si el usuario tiene permiso "acceso_panel_admin" */}
      <AdminAccessButton />
      
    </Container>
  );
}