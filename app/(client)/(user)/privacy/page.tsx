const PrivacyPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Políticas de privacidad</h1>
      <div className="space-y-4">
        <section>
          <h2 className="text-xl font-semibold mb-2">
            1. Recopilación de información
          </h2>
          <p>
            Recopilamos la información que nos proporciona directamente al usar nuestros servicios, así como información sobre su uso de los mismos.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">2. Uso de la información</h2>
          <p>
            Utilizamos la información que recopilamos para proporcionar, mantener y mejorar nuestros servicios, así como para comunicarnos con usted.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">3. Compartir información</h2>
          <p>
            No compartimos su información personal con terceros, salvo en los casos descritos en esta Política de Privacidad o con su consentimiento.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">4. Seguridad de los datos</h2>
          <p>
            Tomamos medidas razonables para proteger su información personal contra pérdida, robo, uso indebido y acceso no autorizado.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">5. Sus derechos</h2>
          <p>
            Tiene derecho a acceder, corregir o eliminar su información personal. Póngase en contacto con nosotros para obtener ayuda con estas solicitudes.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
