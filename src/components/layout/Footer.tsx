import { Link } from 'react-router-dom';

export const Footer = () => (
  <footer className="mt-12 border-t border-border bg-muted/30">
    <div className="container mx-auto px-4 py-4 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 text-muted-foreground">
      <div>
        © {new Date().getFullYear()} Chileneros. Todos los derechos reservados.
      </div>
      <div className="flex items-center gap-4">
        <Link to="/privacy" className="hover:text-foreground">Política de Privacidad</Link>
        <Link to="/forum-rules" className="hover:text-foreground">Reglas del Foro</Link>
      </div>
    </div>
  </footer>
);

export default Footer;


