import { ApiExpert, ApiFile, ApiMethodologyItem } from '../api/types';
import { IMethodCard, IMethodCardLink } from '../../../methods.models';

/**
 * Get display name for document type
 */
export const getDocTypeDisplayName = (docType: string): string => {
  switch (docType?.toLowerCase()) {
    case 'framework':
      return 'Framework';
    case 'template':
      return 'Template';
    case 'example':
      return 'Best Practice Examples';
    default:
      return docType || 'Documentation';
  }
};

/**
 * Convert expert object to user format
 */
export const expertToUser = (expert: ApiExpert) => {
  if (expert.firstName && expert.lastName) {
    return {
      firstName: expert.firstName,
      lastName: expert.lastName,
    };
  }

  if (expert.name) {
    const nameParts = expert.name.split(' ');
    return {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
    };
  }

  return {
    firstName: 'Unknown',
    lastName: 'Expert',
  };
};

/**
 * Calculate maximum depth of a nested methodology structure
 */
export const getMaxDepth = (items: any, depth: number = 1, maxFound = 1): number => {
  let maxDepth = Math.max(depth, maxFound);

  // Check if items is an array before using forEach
  if (!Array.isArray(items)) {
    console.error('Expected array for getMaxDepth, received:', items);
    return maxDepth;
  }

  items.forEach((item) => {
    if (item && item.children && Array.isArray(item.children) && item.children.length > 0) {
      maxDepth = Math.max(maxDepth, getMaxDepth(item.children, depth + 1, maxDepth));
    }
  });

  return maxDepth;
};

/**
 * Map API response to component model format
 */
export const mapApiResponseToMethodCards = (
  apiData: ApiMethodologyItem[],
  accumulatedFiles: ApiFile[] = [],
  accumulatedExperts: ApiExpert[] = []
): IMethodCard[] => {
  if (!apiData || !Array.isArray(apiData)) {
    console.error('Invalid API data received:', apiData);
    return [];
  }

  // Sort by order first if available
  const sortedData = [...apiData].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Map to our model format
  return sortedData.map((item, index) => {
    // Determine if this is a method-level item
    const isMethodLevel = item.nodeType === 'step';

    // Combine current item files with accumulated files
    const allFiles = [...(accumulatedFiles || []), ...(item.files || [])];

    // Remove duplicates based on fileId
    const uniqueFiles = allFiles.filter(
      (file, idx, self) => idx === self.findIndex((f) => f.fileId === file.fileId)
    );

    // Get the full list of experts
    const itemExperts = item.experts || [];

    // Combine current item experts with accumulated experts
    const allExperts = [...(accumulatedExperts || []), ...itemExperts];

    // Remove duplicate experts by checking either _id or name
    const uniqueExperts = allExperts.filter((expert, idx, self) => {
      if (expert._id) {
        return idx === self.findIndex((e) => e._id === expert._id);
      }
      if (expert.name) {
        return idx === self.findIndex((e) => e.name === expert.name);
      }
      return true; // Keep if no ID or name for comparison
    });

    // For method-level cards, we need to ensure step numbers are shown
    // but we don't want to show the toggle arrow if there are no real files
    const hasRealFiles = uniqueFiles.length > 0;

    // Create special "numberOnly" flag for method cards without files
    const numberOnly = isMethodLevel && !hasRealFiles;

    // Group files by docType
    const filesByDocType: Record<string, ApiFile[]> = {};

    uniqueFiles.forEach((file) => {
      const docType = file.docType || 'other';
      if (!filesByDocType[docType]) {
        filesByDocType[docType] = [];
      }
      filesByDocType[docType].push(file);
    });

    // Create links organized by docType
    const links: IMethodCardLink[] = [];

    // Define the order of docTypes
    const docTypeOrder = ['framework', 'template', 'example', 'other'];

    // Sort document types by the defined order
    const sortedDocTypes = Object.keys(filesByDocType).sort((a, b) => {
      const indexA = docTypeOrder.indexOf(a.toLowerCase());
      const indexB = docTypeOrder.indexOf(b.toLowerCase());
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    // Create a link group for each docType
    sortedDocTypes.forEach((docType) => {
      if (filesByDocType[docType]?.length) {
        links.push({
          title: getDocTypeDisplayName(docType),
          children: filesByDocType[docType].map((file) => ({
            title: file.originalFileName,
            url: file.url || '',
          })),
        });
      }
    });

    // Map experts to users format - ensure all are properly included
    const users = uniqueExperts.length > 0 ? uniqueExperts.map(expertToUser) : undefined;

    return {
      id: item._id,
      title: item.name,
      description: item.description,
      nodeType: item.nodeType,
      nextLevelName: item.nextLevelName,
      // For method-level nodes, always show index whether or not there are files
      showIndex: isMethodLevel,
      // Add numberOnly flag for method cards without files
      numberOnly,
      // Include the order number if available, otherwise use index + 1
      order: item.order || index + 1,
      // Add links organized by docType when there are real files
      links: links.length > 0 ? links : undefined,
      // Add users from accumulated experts
      users,
      // Keep original files and experts data for accumulation
      originalFiles: item.files || [],
      originalExperts: itemExperts,
      // Initialize empty children array which can be populated later
      children: [],
    };
  });
};
