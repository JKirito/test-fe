import { initializeAuth } from './lib/store/features/auth/authSlice';
import { useEffect, Suspense } from 'react';
import { useAppDispatch, useAppSelector } from './lib/store/store';
import { useRoutes, useLocation } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { routes } from './routes';
import { Header } from './einstein/components/common/header/header';
import { featureFlags } from './lib/config/featureFlags';
import { FeedbackForm } from './components/feedback-form/FeedbackForm';

function App() {
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const element = useRoutes(routes);
  const location = useLocation();

  useEffect(() => {
    if (featureFlags.isAuthEnabled) {
      dispatch(initializeAuth());
    }

    const deploymentEnv = process.env.REACT_APP_CUSTOM_ENV_NAME;
    if (deploymentEnv === 'production') {
      document.title = 'Einstein';
    } else {
      document.title = 'Einstein - Development';
    }
  }, [dispatch]);

  if (isLoading && featureFlags.isAuthEnabled) {
    return <Loader />;
  }

  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isLoginPage && <Header />}
      {isAuthenticated && <FeedbackForm />}
      <Suspense fallback={<Loader />}>{element}</Suspense>
    </>
  );
}

export default App;
