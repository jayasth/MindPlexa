import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import styles from './LandingLayout.module.css'; // Import the module CSS

export default function LandingLayout({ children }) {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.mainContent}>{children}</main>
      <Footer />
    </div>
  );
}
