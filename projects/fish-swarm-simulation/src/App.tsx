import { useCallback, useEffect, useState } from 'react';
import { FishSchool2DPage } from './experiments/fish-school-2d/FishSchool2DPage';
import { FishTank3DPage } from './experiments/fish-tank-3d/FishTank3DPage';

type ExperimentRoute = '2d' | '3d';

export function App() {
  const [route, setRoute] = useState<ExperimentRoute>(getRouteFromPath);

  useEffect(() => {
    const handlePopState = () => setRoute(getRouteFromPath());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((nextRoute: ExperimentRoute) => {
    window.history.pushState(null, '', `/${nextRoute}`);
    setRoute(nextRoute);
  }, []);

  if (route === '2d') {
    return <FishSchool2DPage onNavigate3D={() => navigate('3d')} />;
  }

  return <FishTank3DPage onNavigate2D={() => navigate('2d')} />;
}

function getRouteFromPath(): ExperimentRoute {
  return window.location.pathname.startsWith('/2d') ? '2d' : '3d';
}
