import { useRoutes } from 'react-router-dom';
import { commonRoutes } from './commonRoutes';
import { wrapElement } from './wrapElement';
import { protectRoutes } from './protectRoutes';
import { publicRoutes } from './publicRoutes';

function AppRoutes() {
  const allRoutes = [...commonRoutes, ...protectRoutes, ...publicRoutes];
  const element = useRoutes(wrapElement(allRoutes));
  return <>{element}</>;
}

export default AppRoutes;
