import Container from "@/components/Container";

const AboutPage = () => {
  return (
    <div className="">
      <Container className="max-w-6xl lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-6">Acerca de Smartcloth</h1>
        <p className="mb-4">
          Smartcloth es una empresa tecnológica innovadora dedicada a ofrecer
          soluciones modernas para los negocios de hoy. Fundada en 2020,
          nos hemos posicionado rápidamente como líderes en transformación
          digital y desarrollo de software.
        </p>
        <p className="mb-4">
          Nuestro equipo de desarrolladores, diseñadores y estrategas trabaja
          incansablemente para crear soluciones personalizadas que ayudan a
          nuestros clientes a optimizar sus operaciones, aumentar la eficiencia
          y potenciar su crecimiento.
        </p>
        <p>
          En Smartcloth, creemos en el poder de la tecnología para transformar
          los negocios y mejorar la vida de las personas. Nos comprometemos a
          mantenernos a la vanguardia de los avances tecnológicos y a ofrecer
          un valor excepcional a nuestros clientes.
        </p>
      </Container>
    </div>
  );
};

export default AboutPage;
