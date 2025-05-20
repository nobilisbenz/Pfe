import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    dateAdmitted: '',
    currentClassLevel: '',
    program: '',
    qualification: '',
    subject: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      // Ici, vous devrez appeler votre API pour récupérer les données du profil
      // Pour l'instant, on utilise les données du contexte d'authentification
      setProfileData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        dateAdmitted: user?.dateAdmitted || '',
        currentClassLevel: user?.currentClassLevel || '',
        program: user?.program || '',
        qualification: user?.qualification || '',
        subject: user?.subject || ''
      });
    } catch (err) {
      setError('Erreur lors du chargement du profil');
      console.error('Erreur de chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mandarine-500"></div>
      </div>
    );
  }

  const InfoField = ({ icon: Icon, label, value }) => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <label className="block text-sm font-medium text-gray-500 mb-1">
        {Icon && <Icon className="inline mr-2" />}
        {label}
      </label>
      <div className="text-gray-900 font-medium">{value || 'Non renseigné'}</div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mon Profil</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoField 
          icon={FiUser}
          label="Nom complet"
          value={profileData.name}
        />
        
        <InfoField 
          icon={FiMail}
          label="Email"
          value={profileData.email}
        />
        
        <InfoField 
          icon={FiPhone}
          label="Téléphone"
          value={profileData.phone}
        />

        {user?.role === 'student' && (
          <>
            <InfoField 
              icon={FiCalendar}
              label="Date d'admission"
              value={profileData.dateAdmitted && new Date(profileData.dateAdmitted).toLocaleDateString('fr-FR')}
            />
            
            <InfoField 
              label="Niveau de classe"
              value={profileData.currentClassLevel === 'Level 100' ? 'Première année' :
                     profileData.currentClassLevel === 'Level 200' ? 'Deuxième année' :
                     profileData.currentClassLevel === 'Level 300' ? 'Troisième année' : ''}
            />
            
            <InfoField 
              label="Programme"
              value={profileData.program}
            />
          </>
        )}

        {user?.role === 'teacher' && (
          <>
            <InfoField 
              label="Qualification"
              value={profileData.qualification}
            />
            
            <InfoField 
              label="Matière enseignée"
              value={profileData.subject}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;