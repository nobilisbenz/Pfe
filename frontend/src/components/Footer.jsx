import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Formation',
      links: [
        { name: 'Catalogue des cours', href: '/courses' },
        { name: 'Certifications', href: '/certifications' },
        { name: 'Calendrier', href: '/schedule' },
      ],
    },
    {
      title: 'Notre École',
      links: [
        { name: 'À propos', href: '/about' },
        { name: 'Équipe pédagogique', href: '/team' },
        { name: 'Actualités', href: '/news' },
      ],
    },
    {
      title: 'Informations',
      links: [
        { name: 'FAQ', href: '/faq' },
        { name: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Légal',
      links: [
        { name: 'Mentions légales', href: '/legal' },
        { name: 'Politique de confidentialité', href: '/privacy' },
        { name: 'CGU', href: '/terms' },
        { name: 'Cookies', href: '/cookies' },
      ],
    },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: '📱', href: 'https://www.facebook.com/Sonelgaz.energy.dz/' },
    { name: 'Twitter', icon: '🐦', href: 'https://x.com/FSonelgazOQ Q' },
    { name: 'LinkedIn', icon: '💼', href: 'https://linkedin.com/company/efgb' },
    { name: 'Instagram', icon: '📸', href: 'https://instagram.com/efgb' },
    { name: 'YouTube', icon: '🎥', href: 'https://www.youtube.com/channel/UCVidWHwUw2587_s1L944I8w/featured' },
  ];

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Section principale */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo et description */}
          <div className="lg:col-span-2">
            <Link to="/" className="text-2xl font-bold hover:text-blue-400 transition-colors">
              EFGB Portal
            </Link>
            <p className="mt-4 text-gray-400 max-w-md">
              Centre d&apos;excellence en formation professionnelle, 
              spécialisé dans les métiers du numérique et de l&apos;innovation.
            </p>
            {/* Contact rapide */}
            <div className="mt-6 space-y-2">
              <p className="text-gray-400 flex items-center">
                <span className="mr-2">📍</span> 
              </p>
              <p className="text-gray-400 flex items-center">
                <span className="mr-2">📞</span> 
              </p>
              <p className="text-gray-400 flex items-center">
                <span className="mr-2">📧</span>
              </p>
            </div>
          </div>

          {/* Sections de liens */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4 text-white">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Barre de séparation */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <p className="text-gray-400 text-sm">
              © {currentYear} EFGB Portal. Tous droits réservés.
            </p>

            {/* Réseaux sociaux */}
            <div className="flex space-x-6 mt-4 md:mt-0">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                >
                  <span className="text-xl" title={social.name}>
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
            <p className="text-gray-400 text-sm">
              Inscrivez-vous à notre newsletter pour recevoir nos actualités
            </p>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Votre email"
                className="px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors duration-200">
                S&apos;inscrire
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;