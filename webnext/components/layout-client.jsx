'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './navbar.jsx';

export default function LayoutClient({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // Save org_id in localStorage once when layout loads
  useEffect(() => {
    localStorage.setItem('org_id', '1');
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {!isAuthPage && <Navbar />}
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
