import React from 'react';
import { ExternalLink, Copy } from 'lucide-react';
import { SearchResult } from '@/pages/search/types';
import toast from 'react-hot-toast';
import styles from './SearchResultItem.module.scss';
import { SearchSource, getSourceByIndexName } from '../../config/searchSources';

interface SearchResultItemProps {
  result: SearchResult;
}

// Function to construct the full UNC path using the config
const constructUncPath = (source: SearchSource | undefined, relativePath: string): string => {
  if (!source || !source.uncPath) {
    console.warn(`Source not found or UNC path missing for index: ${source?.indexName}`);
    return relativePath; // Return original path if source/UNC path is missing
  }

  const basePath = source.uncPath;
  let finalRelativePath = relativePath;

  // Extract the drive identifier part from the end of the base path
  const basePathParts = basePath.replace(/\\$/, '').split('\\');
  const driveNameFromBase = basePathParts.pop();

  // Check/remove prefix logic (remains the same)
  const potentialPrefix = driveNameFromBase ? `${driveNameFromBase}\\`.toLowerCase() : null;
  const lowerRelativePath = finalRelativePath.toLowerCase();

  if (potentialPrefix && lowerRelativePath.startsWith(potentialPrefix)) {
    finalRelativePath = finalRelativePath.substring(driveNameFromBase!.length + 1);
  } else if (finalRelativePath.startsWith('\\')) {
    finalRelativePath = finalRelativePath.substring(1);
  }

  return `${basePath}${finalRelativePath}`;
};

// Helper function to extract filename from path
const extractFilename = (filePath: string): string => {
  if (!filePath) return ''; // Handle empty path
  // Find the last occurrence of either / or \
  const lastSlashIndex = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));
  // If a slash is found, return the substring after it
  if (lastSlashIndex >= 0) {
    return filePath.substring(lastSlashIndex + 1);
  }
  // Otherwise, return the original string (it might be a filename already)
  return filePath;
};

const SearchResultItem: React.FC<SearchResultItemProps> = ({ result }) => {
  const { path, title, highlights, index } = result;

  // Get the source configuration based on the result's index
  const source = index ? getSourceByIndexName(index) : undefined;

  const getSourceIcon = (sourceConfig: SearchSource | undefined) => {
    if (!sourceConfig) return null;
    if (sourceConfig.type === 'sharepoint') {
      return <img src="/icons/sharepoint.svg" alt="SharePoint" />; // Use SharePoint icon
    } else if (sourceConfig.type === 'citrix') {
      return <img src="/icons/citrix.svg" alt="Drive" />; // Use Citrix icon
    }
    return null;
  };

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success('Copied to clipboard!');
      })
      .catch((error) => {
        console.error('Failed to copy:', error);
        toast.error('Failed to copy');
      });
  };

  const renderHighlights = (highlightsData: string[] | undefined) => {
    if (!highlightsData || highlightsData.length === 0) return null;
    return (
      <div className={styles.resultHighlights} style={{ marginLeft: '34px', marginTop: '16px' }}>
        {highlightsData.map((highlight, index) => (
          <div
            key={index}
            className={styles.resultHighlight}
            dangerouslySetInnerHTML={{ __html: highlight }}
          />
        ))}
      </div>
    );
  };

  // Determine properties based on the source type from config
  const isSP = source?.type === 'sharepoint';
  const isDrive = source?.type === 'citrix';

  const isUsingFilenameAsTitle = !title || title === 'N/A';
  const displayTitle = isUsingFilenameAsTitle ? extractFilename(path) : title;
  const hasHighlights = highlights && highlights.length > 0;

  let linkHref: string | undefined = undefined;
  let target: string | undefined = undefined;
  let rel: string | undefined = undefined;
  let textToCopy = path;
  let copyTitle = 'Copy path';

  if (isSP) {
    linkHref = path;
    target = '_blank';
    rel = 'noopener noreferrer';
    textToCopy = path;
    copyTitle = 'Copy URL';
  } else if (isDrive) {
    // Construct full UNC path using the config
    const fullUncPath = constructUncPath(source, path);
    linkHref = undefined;
    textToCopy = fullUncPath;
    copyTitle = 'Copy file path';
  }

  return (
    <>
      <div className={styles.resultHeader}>
        <div className={styles.resultTitleContainer}>
          {/* Get icon based on source config */}
          {getSourceIcon(source)}
          <div>
            <h3 className={styles.resultTitle}>
              {linkHref ? (
                <a href={linkHref} target={target} rel={rel}>
                  {displayTitle}
                </a>
              ) : (
                <span>{displayTitle}</span> // Render as non-clickable span if no link
              )}
            </h3>
            {/* Display the path: make it a link for SP, plain text otherwise */}
            {isSP && linkHref ? (
              <a href={linkHref} target={target} rel={rel} className="font-rubik">
                {textToCopy} {/* Use textToCopy for SP link display as well */}
              </a>
            ) : (
              <p
                className="font-rubik text-grayscale-500 mt-1"
                style={{ fontWeight: '300', fontSize: '14px' }}
              >
                [{textToCopy}]
              </p> // Show UNC path for non-SP
            )}
          </div>
        </div>
        <div className={styles.resultActions}>
          {/* External Link button specifically for SharePoint */}
          {isSP && linkHref && (
            <button
              className={styles.actionButton}
              onClick={() => window.open(linkHref, '_blank', 'noopener,noreferrer')}
              title="Open in SharePoint"
            >
              <ExternalLink size={18} />
            </button>
          )}
          {/* Copy button always uses textToCopy determined above */}
          <button
            className={styles.actionButton}
            onClick={() => copyToClipboard(textToCopy)}
            title={copyTitle}
          >
            <Copy size={18} />
          </button>
        </div>
      </div>

      {/* Render highlights if they exist, otherwise render the path description */}
      {hasHighlights ? (
        renderHighlights(highlights)
      ) : (
        <p className={styles.pathDescription}>{path}</p>
      )}
    </>
  );
};

export default SearchResultItem;
