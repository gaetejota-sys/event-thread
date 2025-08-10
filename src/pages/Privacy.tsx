import { Header } from '@/components/layout/Header';

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto px-4 py-8 prose prose-slate max-w-3xl">
      <h1>Política de Privacidad</h1>
      <p>
        En Chileneros valoramos tu privacidad. Esta política explica qué datos recogemos,
        cómo los usamos y tus derechos sobre ellos.
      </p>

      <h2>Datos que recopilamos</h2>
      <ul>
        <li>Cuenta: correo, nombre para mostrar y avatar.</li>
        <li>Contenido: posts, comentarios, mensajes directos.</li>
        <li>Metadatos técnicos: IP aproximada, agente de usuario y estadísticas de uso.</li>
      </ul>

      <h2>Para qué usamos tus datos</h2>
      <ul>
        <li>Proveer el servicio del foro y calendario.</li>
        <li>Moderación y prevención de abuso.</li>
        <li>Mejorar la experiencia del usuario.</li>
      </ul>

      <h2>Con quién compartimos</h2>
      <p>
        No vendemos tus datos. Podemos compartirlos con proveedores estrictamente necesarios
        (por ejemplo, infraestructura y almacenamiento) bajo acuerdos de tratamiento.
      </p>

      <h2>Conservación y seguridad</h2>
      <p>
        Conservamos la información el tiempo necesario para operar el servicio o cumplir
        obligaciones legales. Aplicamos medidas razonables para protegerla.
      </p>

      <h2>Tus derechos</h2>
      <ul>
        <li>Acceder, rectificar o eliminar tus datos personales.</li>
        <li>Revocar consentimientos y limitar el tratamiento.</li>
        <li>Exportar tu información cuando sea aplicable.</li>
      </ul>

      <h2>Contacto</h2>
      <p>
        Para ejercer tus derechos o hacer consultas, escríbenos al correo de contacto indicado
        en tu perfil o en el pie de página del sitio.
      </p>
    </main>
  </div>
);

export default Privacy;


