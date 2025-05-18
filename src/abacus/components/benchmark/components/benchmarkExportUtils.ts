import * as XLSX from 'xlsx';
import { ProcessedBenchmarkData } from '../types/benchmark';

// Define a minimal Project type based on usage in the export function
// TODO: Consider importing this from a shared types location if available
interface Project {
    project_code: string;
    'Project Name': string;
}

export const exportBenchmarkToExcel = (
    benchmarkData: ProcessedBenchmarkData[],
    selectedProjects: Project[],
    excludedProjects: Set<string>,
    excludedRates: Set<string>,
    excludedRows: Set<string>,
    maskProjectNames: boolean = false
) => {
    if (!benchmarkData || !selectedProjects) return;

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet: XLSX.WorkSheet = {};

    // Track current row for writing data
    let rowIndex = 0;

    // Add title row
    const titleCell = { v: 'Benchmark Analysis', t: 's', s: { font: { bold: true, sz: 16 } } };
    worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })] = titleCell;
    rowIndex += 2; // Skip a row after title

    // Add header row with project names
    const headerRow: any[] = ['Code', 'Description'];

    // Filter selected projects to only include non-excluded ones for header generation
    const includedProjects = selectedProjects.filter(
        (project) => !excludedProjects.has(project.project_code)
    );

    // Add project columns to header
    includedProjects.forEach((project) => {
        // Use masked name if maskProjectNames is true
        const projectName = maskProjectNames ? '********' : project['Project Name'];
        headerRow.push(projectName, '', ''); // Project name spans 3 columns
    });

    // Add average columns
    headerRow.push('Average', '');

    // Write header row
    headerRow.forEach((header, colIndex) => {
        worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })] = {
            v: header,
            t: 's',
            s: { font: { bold: true } },
        };
    });
    rowIndex++;

    // Add subheader row with column types
    const subHeaderRow: any[] = ['', ''];

    // Add project subheaders
    includedProjects.forEach(() => {
        subHeaderRow.push('Total', 'Rate/m²', 'Excl');
    });

    // Add average subheaders
    subHeaderRow.push('Total', 'Rate/m²');

    // Write subheader row
    subHeaderRow.forEach((subHeader, colIndex) => {
        worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })] = {
            v: subHeader,
            t: 's',
            s: { font: { bold: true } },
        };
    });
    rowIndex++;

    // Helper function to flatten the hierarchical data
    const flattenData = (data: ProcessedBenchmarkData[], parentIndent = '') => {
        data.forEach((item) => {
            const rowData: any[] = [item.code, parentIndent + item.description];

            // Add project data for included projects
            includedProjects.forEach((project) => {
                const projectCode = project.project_code;

                const rowExclusionKey = `${item.code}-${projectCode}`;
                const isRowExcluded = excludedRows.has(rowExclusionKey);
                const isRateExcluded = excludedRates.has(projectCode);

                // Total column - only add if not excluded
                if (!isRowExcluded) {
                    rowData.push(item.projects[projectCode]?.total ?? 0); // Use ?? 0 for potentially missing projects
                } else {
                    rowData.push(''); // Empty cell for excluded data
                }

                // Rate column - only add if not excluded
                if (!isRowExcluded && !isRateExcluded) {
                    rowData.push(item.projects[projectCode]?.ratePerXX ?? 0); // Use ?? 0
                } else {
                    rowData.push(''); // Empty cell for excluded data
                }

                // Exclusion indicator
                rowData.push(isRowExcluded ? 'Yes' : 'No');
            });

            // Add average columns
            rowData.push(item.average.total);
            rowData.push(item.average.ratePerXX);

            // Write row to worksheet
            rowData.forEach((cellValue, colIndex) => {
                const cell: XLSX.CellObject = {
                    v: cellValue,
                    t: 's', // Default to string type
                };

                // Set cell type and format
                if (typeof cellValue === 'number') {
                    cell.t = 'n';
                    // Format currency for Total and Rate columns (adjust column indices based on header)
                    // Indices: Code (0), Desc (1), Proj1_Total (2), Proj1_Rate (3), Proj1_Excl (4), ... Avg_Total (last-1), Avg_Rate (last)
                    const isTotalOrRateColumn =
                        colIndex >= 2 && // Skip Code and Description
                        colIndex < rowData.length - 2 && // Skip last two Average columns
                        (colIndex - 2) % 3 !== 2; // Skip the 'Excl' column (index 4, 7, 10...)

                    const isAverageTotalColumn = colIndex === rowData.length - 2;
                    const isAverageRateColumn = colIndex === rowData.length - 1;

                    if (isTotalOrRateColumn || isAverageTotalColumn || isAverageRateColumn) {
                        // Check if it's a Rate column (index 3, 6, 9... or the last one)
                        const isRateColumn = (colIndex >= 3 && (colIndex - 2) % 3 == 1) || isAverageRateColumn;
                        if (isRateColumn) {
                            cell.z = '$#,##0.00 "/m²"'; // Format rate with /m²
                        } else {
                            cell.z = '$#,##0.00'; // Format total as currency
                        }
                    }

                } else if (typeof cellValue === 'string') {
                    cell.t = 's';
                } else if (cellValue === null || cellValue === undefined || cellValue === '') {
                    // Use '' for empty value, ensure correct type handling
                    cell.v = '';
                    cell.t = 's'; // Treat explicitly empty cells as strings
                }

                worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })] = cell;
            });

            rowIndex++;

            // Process children if any
            if (item.subRows && item.subRows.length > 0) {
                flattenData(item.subRows, parentIndent + '  ');
            }
        });
    };

    // Process all data
    flattenData(benchmarkData);

    // Set worksheet range
    const range = { s: { c: 0, r: 0 }, e: { c: subHeaderRow.length - 1, r: rowIndex - 1 } };
    worksheet['!ref'] = XLSX.utils.encode_range(range);

    // Set column widths
    const colWidths = [
        { wch: 15 }, // Code
        { wch: 40 }, // Description
    ];

    // Add widths for project columns (Total, Rate, Excl)
    for (let i = 0; i < includedProjects.length; i++) {
        colWidths.push(
            { wch: 15 }, // Total
            { wch: 18 }, // Rate/m² (increased width for suffix)
            { wch: 8 } // Excl
        );
    }

    // Add average column widths
    colWidths.push(
        { wch: 15 }, // Average Total
        { wch: 18 } // Average Rate/m² (increased width for suffix)
    );

    worksheet['!cols'] = colWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Benchmark Data');

    // Generate Excel file
    XLSX.writeFile(workbook, 'benchmark_data.xlsx');
};