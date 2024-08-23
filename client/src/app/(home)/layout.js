import Navbar from '@/components/home/Navbar';
import '.././globals.css';

export default function HomeLayout({ children }) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}