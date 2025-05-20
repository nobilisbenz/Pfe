'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';

const PaymentCourse = ({ courseId, courseTitle, price }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/create-payment-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          courseTitle,
          price
        }),
      });

      const { sessionId } = await response.json();
      // La redirection vers Stripe sera implémentée plus tard
      console.log('Redirection vers la page de paiement...', sessionId);
      
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      alert('Une erreur est survenue lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Détails du cours</h2>
        <div className="space-y-2">
          <h3 className="font-medium">Cours : {courseTitle}</h3>
          <p className="text-gray-600">Prix : {price}€</p>
          <div className="mt-4">
            <h4 className="font-medium mb-2">Ce que vous obtiendrez :</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Accès complet au contenu du cours</li>
              <li>Support pédagogique personnalisé</li>
              <li>Certificat de réussite</li>
              <li>Accès à vie aux mises à jour</li>
            </ul>
          </div>
        </div>
      </div>
      
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Traitement...' : 'Payer maintenant'}
      </button>
    </div>
  );
};

PaymentCourse.propTypes = {
  courseId: PropTypes.string.isRequired,
  courseTitle: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired
};

export default PaymentCourse; 