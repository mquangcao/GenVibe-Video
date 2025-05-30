import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { commonRoutes } from './commonRoutes';
import { mapLayout } from './mapLayout';
import { useAuth } from '@/hooks';
import { protectRoutes } from './protectRoutes';
import { publicRoutes } from './publicRoutes';

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const routes = mapLayout(commonRoutes);

  const optionRoutes = isAuthenticated
    ? mapLayout(protectRoutes)
    : mapLayout(publicRoutes);

  const element = useRoutes([...routes, ...optionRoutes]);
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          Loading...
        </div>
      }
    >
      {element}
    </Suspense>
  );
}

export default AppRoutes;
