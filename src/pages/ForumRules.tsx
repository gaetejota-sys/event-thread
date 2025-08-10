import { Header } from '@/components/layout/Header';

const ForumRules = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto px-4 py-8 prose prose-slate max-w-3xl">
      <h1>Reglas del Foro</h1>
      <p>Estas normas buscan mantener una comunidad respetuosa y útil.</p>

      <h2>1. Respeto</h2>
      <ul>
        <li>No ataques personales, discriminación ni acoso.</li>
        <li>Debate ideas, no personas.</li>
      </ul>

      <h2>2. Contenido</h2>
      <ul>
        <li>Publica en la categoría correcta y con títulos descriptivos.</li>
        <li>Evita spam, contenido ilegal o NSFW.</li>
        <li>Créditos y fuentes cuando corresponda.</li>
      </ul>

      <h2>3. Compra y venta</h2>
      <ul>
        <li>Describe con precisión el producto/servicio.</li>
        <li>No compartas datos sensibles en público.</li>
      </ul>

      <h2>4. Moderación</h2>
      <ul>
        <li>Los moderadores pueden mover/editar/eliminar contenido que incumpla normas.</li>
        <li>Reincidencias pueden conllevar suspensiones.</li>
      </ul>

      <h2>5. Seguridad</h2>
      <ul>
        <li>Protege tu cuenta; no compartas contraseñas.</li>
        <li>Reporta comportamientos sospechosos a la moderación.</li>
      </ul>

      <p>Al usar el foro aceptas estas reglas. Gracias por contribuir a la comunidad.</p>
    </main>
  </div>
);

export default ForumRules;


