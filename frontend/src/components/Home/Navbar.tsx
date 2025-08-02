'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, User } from 'lucide-react';
import { styles } from '@/styles/navbar';

const NavBar = () => {
  const router = useRouter();

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <nav style={styles.navbar}>
      <section style={styles.navContainer}>
        <Link href="/Home">
          <section style={styles.navLink}>
            <section style={isActive('/Home') ? styles.iconWrapperActive : styles.iconWrapper}>
              <Home size={24} />
            </section>
            <section style={isActive('/Home') ? styles.labelActive : styles.label}>
              Home
            </section>
          </section>
        </Link>

        <Link href="/Account">
          <section style={styles.navLink}>
            <section style={isActive('/Account') ? styles.iconWrapperActive : styles.iconWrapper}>
              <User size={24} />
            </section>
            <section style={isActive('/Account') ? styles.labelActive : styles.label}>
              Account
            </section>
          </section>
        </Link>
      </section>
    </nav>
  );
};

export default NavBar;