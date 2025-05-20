import Navbar from '../components/Navbar';
import Schedule from '../components/Schedule';

const SchedulePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-4">
        <Schedule />
      </main>
    </div>
  );
};

export default SchedulePage;