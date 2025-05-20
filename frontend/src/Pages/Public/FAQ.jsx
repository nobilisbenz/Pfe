import { useState, useEffect } from 'react';
import { faqService } from '../../services/faq.service';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        setLoading(true);
        const response = await faqService.getAllFAQs();
        if (response.status === 'success') {
          // Organiser les FAQs par catégorie
          const faqsByCategory = response.data.reduce((acc, faq) => {
            const category = acc.find(cat => cat.category === faq.category);
            if (category) {
              category.questions.push({
                question: faq.question,
                answer: faq.answer
              });
            } else {
              acc.push({
                category: faq.category,
                questions: [{
                  question: faq.question,
                  answer: faq.answer
                }]
              });
            }
            return acc;
          }, []);
          setFaqs(faqsByCategory);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFaqs();
  }, []);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mandarine-500"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-12">
            Questions Fréquentes
          </h1>

          {error && (
            <div className="max-w-3xl mx-auto mb-8">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-8">
                <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
                <div className="space-y-4">
                  {category.questions.map((faq, questionIndex) => {
                    const index = `${categoryIndex}-${questionIndex}`;
                    return (
                      <div
                        key={index}
                        className="card cursor-pointer transition-all duration-200"
                        onClick={() => toggleQuestion(index)}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">{faq.question}</h3>
                          <span className="text-2xl transition-transform duration-200" style={{
                            transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0)'
                          }}>
                            ▼
                          </span>
                        </div>
                        <div className={`grid transition-all duration-200 ${
                          openIndex === index ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
                        }`}>
                          <div className="overflow-hidden">
                            <p className="text-gray-600">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQ;