import { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface SearchContextType {
  projectId: string;
  setProjectId: (id: string) => void;
  projectName: string;
  setProjectName: (name: string) => void;
  getShareableLink: () => string;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Initialize state from URL parameters if available
  const initialProjectId = searchParams.get('projectId') || '';
  const initialProjectName = searchParams.get('projectName') || '';

  const [projectId, setProjectIdState] = useState(initialProjectId);
  const [projectName, setProjectNameState] = useState(initialProjectName);

  // Custom setters that update both state and URL parameters
  const setProjectId = (id: string) => {
    setProjectIdState(id);
    if (id) {
      searchParams.set('projectId', id);
    } else {
      searchParams.delete('projectId');
    }
    setSearchParams(searchParams);
  };

  const setProjectName = (name: string) => {
    setProjectNameState(name);
    if (name) {
      searchParams.set('projectName', name);
    } else {
      searchParams.delete('projectName');
    }
    setSearchParams(searchParams);
  };

  // Effect to handle initial URL parameters
  useEffect(() => {
    // If we have a projectId in the URL but no projectName, we might need to fetch the project details
    if (initialProjectId && !initialProjectName) {
      // You could add an API call here to fetch the project name if needed
      // console.log('Project ID in URL but no name, could fetch project details here');
    }
  }, [initialProjectId, initialProjectName]);

  // Helper function to get a shareable link with the current project
  const getShareableLink = () => {
    const baseUrl = window.location.origin + '/galileo/search';
    const params = new URLSearchParams();

    if (projectId) {
      params.set('projectId', projectId);
    }

    if (projectName) {
      params.set('projectName', projectName);
    }

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  return (
    <SearchContext.Provider
      value={{
        projectId,
        setProjectId,
        projectName,
        setProjectName,
        getShareableLink,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};
