import React from 'react';
import { useBenchmark } from '../../store';

interface TableActionsProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageLimit: number;
}

const TableActions: React.FC<TableActionsProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  pageLimit,
}) => {
  const { applyFilters } = useBenchmark();

  // Function to handle page change
  const handlePageChange = (page: number) => {
    applyFilters(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="benchmark-table__pagination">
      <div className="benchmark-table__pagination-info">
        Showing {totalRecords > 0 ? (currentPage - 1) * pageLimit + 1 : 0} to{' '}
        {Math.min(currentPage * pageLimit, totalRecords)} of {totalRecords} results
        <span className="benchmark-table__pagination-page-info">
          (Page {currentPage} of {totalPages})
        </span>
      </div>

      <div className="benchmark-table__pagination-controls">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className={`benchmark-table__pagination-button e-btn-outline ${
            currentPage === 1 ? 'benchmark-table__pagination-button--disabled' : ''
          }`}
        >
          First
        </button>

        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`benchmark-table__pagination-button e-btn-outline ${
            currentPage === 1 ? 'benchmark-table__pagination-button--disabled' : ''
          }`}
        >
          Prev
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`benchmark-table__pagination-button ${
              currentPage === page ? 'benchmark-table__pagination-button--active' : ''
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`benchmark-table__pagination-button e-btn-outline ${
            currentPage === totalPages ? 'benchmark-table__pagination-button--disabled' : ''
          }`}
        >
          Next
        </button>

        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`benchmark-table__pagination-button e-btn-outline ${
            currentPage === totalPages ? 'benchmark-table__pagination-button--disabled' : ''
          }`}
        >
          Last
        </button>
      </div>
    </div>
  );
};

export default TableActions;
