import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchContext } from '../context/SearchContext';
import { Copy, Check } from 'lucide-react';
import './SearchHeader.scss';

const SearchHeader: React.FC = () => {
  const navigate = useNavigate();
  const { projectId, projectName, getShareableLink } = useSearchContext();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = getShareableLink();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="project-search-header">
      <img src="/icons/galileo.svg" alt="Galileo Logo" className="project-search-header__logo" />
      <div className="project-search-header__content">
        <h1 className="project-search-header__title">
          {projectName
            ? `Let's learn more about Project: ${projectName}`
            : "Let's learn more about Project"}
        </h1>
        <p className="project-search-header__subtitle">
          Search for a project to view detailed analytics and charts
        </p>
      </div>
      <div className="e-btn-group e-btn-group--equal">
        {/* {projectId && (
          <button
            onClick={handleCopyLink}
            className="e-btn-reset e-btn-outline project-search-header__copy-btn"
            title="Copy link to share"
          >
            {copied ? (
              <>
                <Check size={16} className="project-search-header__icon" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} className="project-search-header__icon" />
                Copy Link
              </>
            )}
          </button>
        )} */}
        <button onClick={() => navigate('/galileo')} className="e-btn-reset e-btn-outline">
          Back to Galileo
        </button>
      </div>
    </header>
  );
};

export default SearchHeader;
