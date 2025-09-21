import { Twitter, DollarSign, Linkedin, Github } from "lucide-react";
import type { FC, ReactElement } from "react";

interface SocialLink {
  icon: ReactElement;
  href: string;
  ariaLabel: string;
}

interface FooterLink {
  text: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const socialLinks: SocialLink[] = [
  {
    icon: <Twitter className="w-4 h-4" />,
    href: "#",
    ariaLabel: "Síguenos en Twitter",
  },
  {
    icon: <Linkedin className="w-4 h-4" />,
    href: "#",
    ariaLabel: "Síguenos en LinkedIn",
  },
  {
    icon: <Github className="w-4 h-4" />,
    href: "#",
    ariaLabel: "Síguenos en GitHub",
  },
];

const footerSections: FooterSection[] = [
  {
    title: "Plataforma",
    links: [
      { text: "Cómo Funciona", href: "#" },
      { text: "Para Emprendedores", href: "#" },
      { text: "Para Inversionistas", href: "#" },
      { text: "Casos de Éxito", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { text: "Términos y Condiciones", href: "#" },
      { text: "Política de Privacidad", href: "#" },
      { text: "Seguridad", href: "#" },
      { text: "Cumplimiento", href: "#" },
    ],
  },
];

const Footer: FC = () => {
  return (
    <footer className="bg-slate-900 text-white py-12 shadow-lg border-t border-slate-800">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mr-10">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center bg-indigo-600">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Mañakuna
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-4">
              Plataforma descentralizada de financiamiento para importaciones globales
            </p>
          </div>

          {/* Dynamic Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4 text-indigo-400">
                {section.title}
              </h4>
              <ul className="space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.text}>
                    <a
                      href={link.href}
                      className="text-slate-300 hover:text-indigo-400 transition-colors duration-200 ease-in-out"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-indigo-400">Contacto</h4>
            <p className="text-sm text-slate-300 mb-4">
              varor.joseroberto@gmail.com
              <br />
              +(591) 63905128
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.ariaLabel}
                  href={social.href}
                  aria-label={social.ariaLabel}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-105 text-slate-300 hover:text-white"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;