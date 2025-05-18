export type SourceType = 'sharepoint' | 'citrix';

export interface SearchSource {
  indexName: string; // The actual index name used by the backend
  type: SourceType;
  filterId: string; // Short ID used in the filter UI (e.g., 'Y', 'SP')
  displayName: string; // User-friendly name for filters/UI
  uncPath?: string; // Base UNC path (only for citrix drives)
}

export const SEARCH_SOURCES: SearchSource[] = [
  // SharePoint
  {
    indexName: process.env.REACT_APP_SEARCH_SHAREPOINT_INDEX || 'elastic_sharepoint_index_v5',
    type: 'sharepoint',
    filterId: 'SP', // Consistent ID for SharePoint
    displayName: 'SharePoint',
    // No uncPath for SharePoint
  },
  // Citrix Drives
  {
    indexName: 'citrix_jdrive',
    type: 'citrix',
    filterId: 'J',
    displayName: 'Asia Job Archieve (J: Drive)',
    uncPath: '\\\\tbh-mon1\\J_Drive\\',
  },
  {
    indexName: 'citrix_ydrive_full_nova',
    type: 'citrix',
    filterId: 'Y',
    displayName: 'AUS Job Folders (Y: Drive)',
    uncPath: '\\\\TBH-FS1\\fsdata$\\Y_Drive\\',
  },
  {
    indexName: 'citrix_sdrive',
    type: 'citrix',
    filterId: 'S',
    displayName: 'AUS Shared (S: Drive)',
    uncPath: '\\\\tbh-fs1\\fs$\\Shared\\',
  },
  {
    indexName: 'citrix_idrive',
    type: 'citrix',
    filterId: 'I',
    displayName: 'Asia Job Folders (I: Drive)',
    uncPath: '\\\\tbh-fs1\\fsdata$\\',
  },
  {
    indexName: 'citrix_zdrive',
    type: 'citrix',
    filterId: 'Z',
    displayName: 'AUS Job Archieve (Z: Drive)',
    uncPath: '\\\\tbh-mon1\\Z_Drive\\',
  },
  {
    indexName: 'citrix_udrive',
    type: 'citrix',
    filterId: 'U',
    displayName: 'ME Job Folders (U: Drive)',
    uncPath: 'file:\\\\',
  },
  // {
  //     indexName: 'citrix_me_shared',
  //     type: 'citrix',
  //     filterId: 'ME_SHARED',
  //     displayName: 'ME Shared (In Z: Drive)',
  //     uncPath: '\\\\tbhuaectxdc1\\s$\\Shared\\',
  // },
];

// Helper function to get all index names
export const getAllIndexNames = (): string[] => {
  return SEARCH_SOURCES.map((source) => source.indexName);
};

// Helper function to get index names by type
export const getIndexNamesByType = (type: SourceType): string[] => {
  return SEARCH_SOURCES.filter((source) => source.type === type).map((source) => source.indexName);
};

// Helper function to get index names by filter IDs (for specific drives)
export const getIndexNamesByFilterIds = (filterIds: string[]): string[] => {
  return SEARCH_SOURCES.filter(
    (source) => source.type === 'citrix' && filterIds.includes(source.filterId)
  ).map((source) => source.indexName);
};

// Helper function to get a source by its index name
export const getSourceByIndexName = (indexName: string): SearchSource | undefined => {
  return SEARCH_SOURCES.find((source) => source.indexName === indexName);
};
