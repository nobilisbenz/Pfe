import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Resources from '../components/Resources';

const ResourcesPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-4">
        <Resources />
      </main>
      <Footer />
    </div>
  );
};

export default ResourcesPage;