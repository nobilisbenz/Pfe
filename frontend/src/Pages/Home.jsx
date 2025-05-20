import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0, success: 0 });
  const { ref: statsRef, inView } = useInView({ triggerOnce: true });

  const slides = [
    { image: '/cba_5_5cf39f9a128ae3.72833454.jpg', title: 'Formation d\'excellence' },
    { image: '/cba_3_5cdc0599f003d1.28125889.jpg', title: 'Environnement moderne' },
    { image: '/cba_2_5cdc0598ef4850.79244072.jpg', title: 'Équipements de pointe' },
    { image: '/cba_5cdc0597e2ec42.66025347.jpg', title: 'Apprentissage pratique' },
  ];

  const features = [
    { title: 'Formation', description: 'Accédez à nos programmes de formation', icon: '🎓', link: '/courses' },
    { title: 'FAQ', description: 'Questions fréquemment posées', icon: '❓', link: '/faq' },
    { title: 'Actualités', description: 'Restez informé des dernières nouvelles', icon: '📰', link: '/news' },
    { title: 'Contact', description: 'Contactez-nous pour plus d\'informations', icon: '📞', link: '/contact' },
  ];

  const testimonials = [
    {
      name: 'Ahmed B.',
      role: 'Étudiant en électrotechnique',
      content: 'Une formation exceptionnelle qui m\'a permis d\'acquérir des compétences pratiques essentielles.',
      avatar: '👨‍🎓'
    },
    {
      name: 'Sarah M.',
      role: 'Ingénieure diplômée',
      content: 'Les formateurs sont très compétents et l\'environnement d\'apprentissage est optimal.',
      avatar: '👩‍🔬'
    },
  ];

  useEffect(() => {
    if (inView) {
      // Animation des statistiques
      const finalStats = { students: 1000, teachers: 50, courses: 30, success: 95 };
      const duration = 2000;
      const steps = 50;
      const interval = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        setStats({
          students: Math.round(finalStats.students * progress),
          teachers: Math.round(finalStats.teachers * progress),
          courses: Math.round(finalStats.courses * progress),
          success: Math.round(finalStats.success * progress),
        });

        if (currentStep === steps) clearInterval(timer);
      }, interval);

      return () => clearInterval(timer);
    }
  }, [inView]);

  useEffect(() => {
    // Rotation automatique du carrousel
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Carrousel Hero Section */}
        <div className="relative h-[600px] overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                currentSlide === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 bg-black/40 z-10" />
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 z-20 flex items-center justify-center text-white">
                <div className="text-center">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-6xl font-bold mb-4"
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-xl md:text-2xl mb-8"
                  >
                    Centre d&apos;excellence en formation professionnelle
                  </motion.p>
                </div>
              </div>
            </div>
          ))}
          {/* Indicateurs de navigation */}
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentSlide === index ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Statistiques */}
        <div
          ref={statsRef}
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16"
        >
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">{stats.students}+</div>
                <div className="text-lg">Étudiants formés</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">{stats.teachers}+</div>
                <div className="text-lg">Formateurs experts</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">{stats.courses}+</div>
                <div className="text-lg">Formations disponibles</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">{stats.success}%</div>
                <div className="text-lg">Taux de réussite</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-12 ">Nos Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.a
                href={feature.link}
                key={index}
                className="card hover:scale-105 transition-transform duration-200 cursor-pointer"
                whileHover={{ y: -10 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Témoignages */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Ce que disent nos étudiants</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-lg"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-4">{testimonial.avatar}</span>
                    <div>
                      <h3 className="font-semibold">{testimonial.name}</h3>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">{testimonial.content}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;