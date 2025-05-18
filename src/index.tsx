import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { Provider } from 'react-redux';
import store from './lib/store/store.ts';
import { BrowserRouter } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './lib/config/authConfig.ts';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './lib/config/queryClient.ts';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './index.css';
import TBHLogo from '@/einstein/components/common/TBHLogo.tsx';
import './app.scss';
import { Toaster } from 'react-hot-toast';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin, withAITracking } from '@microsoft/applicationinsights-react-js';
import { createBrowserHistory } from 'history';

// --- Application Insights Setup ---
const browserHistory = createBrowserHistory();
const reactPlugin = new ReactPlugin();
const appInsights = new ApplicationInsights({
  config: {
    connectionString: process.env.REACT_APP_APPLICATIONINSIGHTS_CONNECTION_STRING,
    extensions: [reactPlugin],
    extensionConfig: {
      [reactPlugin.identifier]: { history: browserHistory },
    },
    enableAutoRouteTracking: true, // Automatically tracks route changes
    autoTrackPageVisitTime: true,
  },
});

// Check if connection string is provided before loading
if (process.env.REACT_APP_APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights.loadAppInsights();
  console.log('Application Insights connection string provided. Telemetry enabled.');
} else {
  console.warn('Application Insights connection string not provided. Telemetry disabled.');
}

// Create a component that includes the AI HOC, wrapping the main App content
const AiTrackedApp = withAITracking(reactPlugin, App, 'App');
// --- End Application Insights Setup ---

const container = document.getElementById('root');

const deploymentEnv = process.env.REACT_APP_CUSTOM_ENV_NAME;

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <MsalProvider instance={msalInstance}>
          <Toaster position="top-right" containerStyle={{ top: '80px' }} />
          <Provider store={store}>
            <BrowserRouter>
              <AiTrackedApp />
              <TBHLogo />
            </BrowserRouter>
          </Provider>
        </MsalProvider>
        {deploymentEnv === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom" />
        )}
      </QueryClientProvider>
    </React.StrictMode>
  );
}
