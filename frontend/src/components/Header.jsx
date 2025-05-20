import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-blue-100 transition-colors duration-200">
          EFGB Portal
        </Link>
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login" className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;