import React from 'react';

interface TableContainerProps {
  children: React.ReactNode;
  projectCount: number;
}

export const TableContainer: React.FC<TableContainerProps> = ({ children /*, projectCount*/ }) => {
  return (
    // Simplify: Use a single div for scrolling. Apply height and border here.
    // overflow-x-auto enables horizontal scroll
    // overflow-y-auto enables vertical scroll
    <div className="benchmark-table" style={{ padding: '0px' }}>
      {/* Table with BEM class */}
      <table className="benchmark-table__table">{children}</table>
    </div>
  );
};
