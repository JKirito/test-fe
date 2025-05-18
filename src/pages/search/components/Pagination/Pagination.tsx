import React from 'react';
import styles from './Pagination.module.scss'; // Import component's own styles

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pagesToShow = 5;

  let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + pagesToShow - 1);

  if (endPage - startPage + 1 < pagesToShow) {
    startPage = Math.max(1, endPage - pagesToShow + 1);
  }

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className={styles.searchPagination}>
      <button
        className={styles.paginationBtn}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>

      {startPage > 1 && (
        <>
          <button className={styles.paginationBtn} onClick={() => onPageChange(1)}>
            1
          </button>
          {startPage > 2 && <span className={styles.paginationEllipsis}>...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          // Combine base class with active class conditionally
          className={`${styles.paginationBtn} ${page === currentPage ? styles.active : ''}`.trim()}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className={styles.paginationEllipsis}>...</span>}
          <button className={styles.paginationBtn} onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        className={styles.paginationBtn}
        disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
