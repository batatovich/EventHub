import Header from '@/components/Header';
import '../globals.css';

export default function AuthLayout({ children }) {
  return (
    <div>
      <Header title="EventHub" />
      <main>{children}</main>
    </div>
  );
}
