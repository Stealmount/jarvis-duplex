'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProjectsPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/chat?tab=projects');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', background: '#060608', color: '#fff' }}>
      <p style={{ opacity: 0.6 }}>Loading Projects...</p>
    </div>
  );
}
