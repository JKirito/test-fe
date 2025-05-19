import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/lib/store/store';
import { setProjectId, setProjectName } from '@/lib/store/features/galileo/searchSlice';

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const projectId = useAppSelector((s) => s.search.projectId);
  const projectName = useAppSelector((s) => s.search.projectName);

  useEffect(() => {
    const id = searchParams.get('projectId') || '';
    const name = searchParams.get('projectName') || '';
    dispatch(setProjectId(id));
    dispatch(setProjectName(name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', projectId);
    if (projectName) params.set('projectName', projectName);
    setSearchParams(params);
  }, [projectId, projectName, setSearchParams]);

  return <>{children}</>;
};

export const useSearchContext = () => {
  const dispatch = useAppDispatch();
  const projectId = useAppSelector((s) => s.search.projectId);
  const projectName = useAppSelector((s) => s.search.projectName);

  const setProjectIdHandler = (id: string) => dispatch(setProjectId(id));
  const setProjectNameHandler = (name: string) => dispatch(setProjectName(name));

  const getShareableLink = () => {
    const baseUrl = window.location.origin + '/galileo/search';
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', projectId);
    if (projectName) params.set('projectName', projectName);
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  return {
    projectId,
    setProjectId: setProjectIdHandler,
    projectName,
    setProjectName: setProjectNameHandler,
    getShareableLink,
  };
};
