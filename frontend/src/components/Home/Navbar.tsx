'use client';

import { styles } from '@/styles/navbar';
import { Home, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleCreatePost = () => {
    router.push('/AddPost');
  };

  return (
    <nav style={styles.navbar}>
      <section style={styles.navContainer}>
        <Link href="/Home" style={styles.link}>
          <section style={styles.navLink}>
            <section style={isActive('/Home') ? styles.iconWrapperActive : styles.iconWrapper}>
              <Home size={24} />
            </section>
            <section style={isActive('/Home') ? styles.labelActive : styles.label}>
              Home
            </section>
          </section>
        </Link>

        <div style={styles.link}>
          <section style={styles.navLink} onClick={handleCreatePost}>
            <section style={isActive('/AddPost') ? styles.iconWrapperActive : styles.iconWrapper}>
              <Plus size={24} />
            </section>
            <section style={isActive('/AddPost') ? styles.labelActive : styles.label}>
              Post
            </section>
          </section>
        </div>

        <Link href="/account" style={styles.link}>
          <section style={styles.navLink}>
            <section style={isActive('/account') ? styles.iconWrapperActive : styles.iconWrapper}>
              <User size={24} />
            </section>
            <section style={isActive('/account') ? styles.labelActive : styles.label}>
              Account
            </section>
          </section>
        </Link>
      </section>
    </nav>
  );
};

export default NavBar;