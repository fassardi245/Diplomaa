import React from "react";
import Image from "next/image";

// Importamos la imagen desde tu ruta relativa actual
import logoImg from "../../images/Logo_PNG_1.png"; 

const HomeBanner = () => {
  return (
    // CAMBIOS AQUI: 
    // 1. 'pt-4': Reduce el espacio con la Nav Bar (antes era py-10 que es mucho)
    // 2. 'pb-0': Quita el espacio abajo para pegarse a las categorías
    // 3. 'gap-2': Acerca el Texto a la Imagen (antes era gap-6)
    <div className="flex flex-col items-center justify-center gap-2 pt-4 pb-0">
      
      {/* 1. LOGO PRINCIPAL */}
      <div className="relative w-full max-w-[400px] flex justify-center">
        <Image 
          src={logoImg} 
          alt="SmartCloth Logistics Logo"
          priority
          className="object-contain drop-shadow-md h-auto w-auto"
        />
      </div>

      {/* 2. NUEVO ESLOGAN */}
      <div className="text-center px-4">
        <p className="text-sm md:text-base text-gray-500 font-medium max-w-[600px] mx-auto leading-relaxed">
          Ropa de la mejor calidad y a precios accesibles.
        </p>
      </div>

    </div>
  );
};

export default HomeBanner;