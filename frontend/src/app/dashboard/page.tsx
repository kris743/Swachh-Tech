'use client';

import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import CitizenDashboard from './CitizenDashboard';
import WorkerDashboard from './WorkerDashboard';
import MunicipalDashboard from './MunicipalDashboard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRouter() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const role = user?.role?.toUpperCase();

  if (role === 'WORKER') {
    return <WorkerDashboard />;
  }

  if (role === 'ADMIN' || role === 'MUNICIPAL') {
    return <MunicipalDashboard />;
  }

  return <CitizenDashboard />;
}

