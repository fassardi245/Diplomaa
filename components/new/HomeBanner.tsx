import React from "react";
import Title from "../Title";

const HomeBanner = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <Title className="uppercase text-3xl md:text-4xl font-bold text-center">
        LA MEJOR ROPA
      </Title>
      <p className="text-sm text-center text-lightColor/80 font-medium max-w-[480px] ">
        Encontra todo lo que necesitas para verte y sentirte lo mejor posible, compra lo último en moda para hombre.
      </p>
    </div>
  );
};

export default HomeBanner;
