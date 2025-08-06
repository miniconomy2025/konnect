'use client';

import NavBar from '@/components/Home/Navbar';
import { styles } from '@/styles/mainLayout';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <section style={styles.container}>
      <main style={{
        ...styles.main,
        position: 'relative',
        zIndex: 1,
      }}>
        {children}
      </main>
      <NavBar />
    </section>
  );
};

export default Layout;