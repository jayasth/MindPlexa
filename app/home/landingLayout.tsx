import Navbar from '@/ui/Navbar';
import Footer from '@/ui/Footer';
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
