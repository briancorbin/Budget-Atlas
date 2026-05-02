import { useEffect, useState } from 'react';
import { BudgetExplorer } from '@/components/BudgetExplorer';
import { Roadmap } from '@/components/Roadmap';

type Route = 'atlas' | 'roadmap';

function routeFromHash(hash: string): Route {
  return hash.replace(/^#\/?/, '').toLowerCase() === 'roadmap' ? 'roadmap' : 'atlas';
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => routeFromHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [route]);

  if (route === 'roadmap') {
    return <Roadmap onBack={() => { window.location.hash = ''; }} />;
  }
  return <BudgetExplorer />;
}
