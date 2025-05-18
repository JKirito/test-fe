import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import MethodologyFormNew from './einstein/components/admin/methodologies/MethodologyFormNew';
import ProtectedRoute from './einstein/components/auth/ProtectedRoute';
import { featureFlags } from './lib/config/featureFlags';
import HowToPage from './einstein/components/howto/HowToPage';
import Playground from './playground/Playground';
import { Outlet } from 'react-router-dom';
import { useAppSelector } from './lib/store/store';
import SignIn from './pages/sign-in/sign-in';
import Methods from './pages/methods/methods';
import SearchResults from './pages/search/SearchResults';
import BenchmarkPage from './pages/galileo/benchmark/components/BenchmarkPage';
import CuriosityHome from './pages/curiosity/CuriosityHome';
import NotFound from './einstein/components/common/errors/NotFound';

// Lazy-loaded components
// const LoginPage = lazy(() => import('./einstein/components/login/LoginPage'));
const AdminLayout = lazy(() => import('./einstein/components/admin/layout/AdminLayout'));
const AdminPage = lazy(() => import('./einstein/components/admin/AdminPage'));
const MapPage = lazy(() => import('./einstein/components/map/MapPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/dashboard'));
const ServerDown = lazy(() => import('./einstein/components/common/errors/ServerDown'));
const AbacusCostInputPage = lazy(() => import('./abacus/components/home/HomePage'));
const AbacusBenchmarkPage = lazy(() => import('./abacus/components/benchmark/BenchmarkContent'));
const AbacusSearchPage = lazy(() => import('./abacus/components/searchDatabase/SearchPage'));
const AdminHowToPage = lazy(() => import('./einstein/components/admin/howTo/HowToPage'));
const AbacusCostHomePage = lazy(() => import('./abacus/components/home/Abacus-cost-home'));
const GalileoBenchmarkPage = lazy(
  () => import('./pages/galileo/benchmark/components/BenchmarkPage')
);
const GalileoSearchPage = lazy(() => import('./pages/galileo/search/components/SearchPage'));

// Helper to wrap components with ProtectedRoute
const protectedRoute = (component: JSX.Element): JSX.Element => (
  <ProtectedRoute>{component}</ProtectedRoute>
);

// Auth guard for login page - redirects to home if already authenticated
const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Define all routes
export const routes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <AuthGuard>
        {/* <LoginPage /> */}
        <SignIn />
      </AuthGuard>
    ),
  },
  {
    path: '/',
    // element: protectedRoute(<HomePage />),
    element: protectedRoute(<DashboardPage />),
  },
  {
    path: '/map',
    element: protectedRoute(<MapPage />),
  },
  {
    path: '/search/:query?',
    element: protectedRoute(<SearchResults />),
  },
  {
    path: '/methodologies',
    // element: protectedRoute(<MethodologiesPage />),
    element: protectedRoute(<Methods />),
  },
  {
    path: '/curiosity',
    element: protectedRoute(<CuriosityHome />),
  },
  {
    path: '/galileo',
    element: protectedRoute(<GalileoBenchmarkPage />),
  },
  // Removed standalone chart view route - now handled within the main Galileo page
  {
    path: '/galileo/benchmarks',
    element: protectedRoute(<BenchmarkPage />),
  },
  {
    path: '/galileo/search',
    element: protectedRoute(<GalileoSearchPage />),
  },
  // Removed duplicate route for '/galileo/benchmarks/micro'
  {
    path: '/playground',
    element: protectedRoute(<Playground />),
  },
  // Abacus routes
  ...(featureFlags.isAbacusEnabled
    ? [
        {
          path: '/abacus-cost/',
          element: protectedRoute(<AbacusCostHomePage />),
        },
        {
          path: '/abacus-cost/input',
          element: protectedRoute(<AbacusCostInputPage />),
        },
        {
          path: '/abacus-cost/benchmark',
          element: protectedRoute(<AbacusBenchmarkPage />),
        },
        {
          path: '/abacus-cost/search',
          element: protectedRoute(<AbacusSearchPage />),
        },
      ]
    : []),
  // How-to routes
  ...(featureFlags.isHowToEnabled
    ? [
        {
          path: '/how-to',
          element: protectedRoute(<HowToPage />),
        },
      ]
    : []),
  // Admin routes
  {
    path: '/admin',
    element: protectedRoute(
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    ),
    children: [
      {
        path: '',
        element: <AdminPage />,
      },
      {
        path: 'users',
        element: <div>Users</div>,
      },
      {
        path: 'methodologies',
        element: <MethodologyFormNew />,
      },
      {
        path: 'how-to',
        element: <AdminHowToPage />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    path: '/server-down',
    element: <ServerDown />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];
