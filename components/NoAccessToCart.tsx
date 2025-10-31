import React from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Logo from "./new/Logo";

const NoAccessToCart = () => {
  return (
    <div className="flex items-center justify-center py-12 md:py-32 bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center">
            <Logo>Smartcloth</Logo>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            ¡Bienvenido nuevamente!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center font-medium">
            Iniciá sesión para ver los productos de tu carrito y finalizar tu compra.
            ¡No te pierdas tus artículos favoritos!
          </p>
          <SignInButton mode="modal">
            <Button className="w-full font-semibold" size="lg">
              Iniciar sesión
            </Button>
          </SignInButton>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            ¿No tenés una cuenta?
          </div>
          <SignUpButton mode="modal">
            <Button variant="outline" className="w-full" size="lg">
              Crear una cuenta
            </Button>
          </SignUpButton>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NoAccessToCart;
