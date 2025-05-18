import { BenchmarkResponse, ProcessedBenchmarkData } from '../types/benchmark';
import { IBenchmarkProject } from '../types';

/**
 * Processes the raw benchmark response data into a structured hierarchical format.
 * Filters out L4 codes and builds parent-child relationships for L1, L2, and L3 codes.
 * Calculates aggregate sums and averages for parent nodes based on their children.
 *
 * @param response The raw benchmark response from the API.
 * @returns An array of processed benchmark data objects, structured hierarchically.
 */
export const processBenchmarkData = (response: BenchmarkResponse): ProcessedBenchmarkData[] => {
    if (!response?.data?.benchmarks || !response?.data?.codes) {
        console.warn('Missing benchmark data or codes in response');
        return [];
    }

    const { benchmarks, codes } = response.data;
    const processedData: { [code: string]: ProcessedBenchmarkData } = {};

    // 1. Collect all unique ICMS codes (L1, L2, L3) and descriptions
    const allCodes = new Set<string>();
    const codeDescriptions = new Map<string, string>();

    codes.forEach((codeItem) => {
        if (codeItem?.master_code) {
            const level = codeItem.master_code.split('.').length;
            if (level <= 3) {
                allCodes.add(codeItem.master_code);
                codeDescriptions.set(codeItem.master_code, codeItem.master_description || '');
            }
        }
    });

    Object.values(benchmarks).forEach((items) => {
        if (Array.isArray(items)) {
            items.forEach((item) => {
                if (item?.icms_code) {
                    const level = item.icms_code.split('.').length;
                    if (level <= 3) {
                        allCodes.add(item.icms_code);
                        // Use existing description or fallback to code if not found in codes array
                        if (!codeDescriptions.has(item.icms_code)) {
                            codeDescriptions.set(item.icms_code, item.icms_code);
                        }
                    }
                }
            });
        }
    });

    // 2. Initialize data structure for all L1-L3 codes
    Array.from(allCodes).forEach((code) => {
        processedData[code] = {
            code,
            description: codeDescriptions.get(code) || code,
            projects: {},
            average: { total: 0, ratePerXX: 0 },
            level: code.split('.').length - 1, // 0-indexed level
            subRows: [],
        };
    });

    // 3. Populate project data for each code (excluding L4 explicitly)
    Object.entries(benchmarks).forEach(([projectCode, items]) => {
        if (!Array.isArray(items)) return;

        items.forEach((item) => {
            if (!item?.icms_code) return;

            const level = item.icms_code.split('.').length;
            if (level > 3) return; // Skip L4 codes

            // Ensure the code exists in our processedData (it should, due to step 1 & 2)
            if (processedData[item.icms_code]) {
                processedData[item.icms_code].projects[projectCode] = {
                    total: item.total_amount || 0,
                    ratePerXX: item.total_rate || 0,
                    excl: false, // Assuming default is false, adjust if needed
                };
            } else {
                console.warn(`Skipping benchmark item for code ${item.icms_code} as it wasn't pre-initialized (potentially unexpected L4 or data mismatch).`);
            }
        });
    });

    // 4. Build Hierarchy (Parent-Child Relationships)
    const result = Object.values(processedData).sort((a, b) => {
        // Sort numerically by padding parts for correct ordering (e.g., 1.10 > 1.2)
        const aParts = a.code.split('.').map((part) => part.padStart(3, '0'));
        const bParts = b.code.split('.').map((part) => part.padStart(3, '0'));
        return aParts.join('.').localeCompare(bParts.join('.'));
    });

    const hierarchicalData: ProcessedBenchmarkData[] = [];
    const itemsByCode: { [code: string]: ProcessedBenchmarkData } = {};
    result.forEach(item => itemsByCode[item.code] = item);

    result.forEach((item) => {
        if (item.level === 0) {
            hierarchicalData.push(item);
        } else {
            const parentCode = item.code.split('.').slice(0, -1).join('.');
            const parent = itemsByCode[parentCode];
            if (parent) {
                // Ensure subRows exists (initialize if first child)
                if (!parent.subRows) {
                    parent.subRows = [];
                }
                parent.subRows.push(item);
                // Sorting subRows happens implicitly because 'result' is already sorted
            } else {
                // This might happen if a child code exists without a parent (data inconsistency)
                // console.warn(`Could not find parent (${parentCode}) for code ${item.code}. Adding as top-level.`);
                // Optionally add orphaned items to the top level if necessary:
                // hierarchicalData.push(item);
            }
        }
    });

    // 5. Calculate Hierarchical Sums and Averages (Post-order traversal logic)
    const calculateHierarchicalSums = (node: ProcessedBenchmarkData) => {
        // If it's a leaf node (no subRows or empty subRows), its sums are based on its own projects data.
        // The averages are calculated at the end.

        // If it has children, first calculate sums for all children recursively.
        if (node.subRows && node.subRows.length > 0) {
            node.subRows.forEach((child) => calculateHierarchicalSums(child));

            // Initialize project aggregates for this parent node
            const parentProjectAggregates: {
                [projectCode: string]: { total: number; rateSum: number; rateCount: number };
            } = {};
            const allChildProjectCodes = new Set<string>();

            // Collect data from direct children
            node.subRows.forEach((child) => {
                Object.entries(child.projects).forEach(([projectCode, projectData]) => {
                    allChildProjectCodes.add(projectCode);
                    if (!parentProjectAggregates[projectCode]) {
                        parentProjectAggregates[projectCode] = { total: 0, rateSum: 0, rateCount: 0 };
                    }
                    parentProjectAggregates[projectCode].total += projectData.total;
                    // Only include positive rates in the average calculation for ratePerXX
                    if (projectData.ratePerXX > 0) {
                        parentProjectAggregates[projectCode].rateSum += projectData.ratePerXX;
                        parentProjectAggregates[projectCode].rateCount++;
                    }
                });
            });

            // Update parent node's projects data based on aggregated child data
            node.projects = {}; // Reset parent projects, calculate purely from children
            Array.from(allChildProjectCodes).forEach((projectCode) => {
                const aggregate = parentProjectAggregates[projectCode];
                node.projects[projectCode] = {
                    total: aggregate.total,
                    // Calculate average rate, avoiding division by zero
                    ratePerXX: aggregate.rateCount > 0 ? aggregate.rateSum / aggregate.rateCount : 0,
                    excl: false, // Determine exclusion logic if needed, default false
                };
            });
        }

        // Calculate final averages for this node (whether leaf or parent) based on its 'projects' data.
        const validTotals = Object.values(node.projects)
            .filter(p => !p.excl) // Consider exclusion flag if applicable
            .map((p) => p.total)
            .filter((total) => total > 0); // Consider only positive totals for average

        const validRates = Object.values(node.projects)
            .filter(p => !p.excl) // Consider exclusion flag
            .map((p) => p.ratePerXX)
            .filter((rate) => rate > 0); // Consider only positive rates for average

        node.average = {
            total:
                validTotals.length > 0
                    ? validTotals.reduce((sum, val) => sum + val, 0) / validTotals.length
                    : 0,
            ratePerXX:
                validRates.length > 0
                    ? validRates.reduce((sum, val) => sum + val, 0) / validRates.length
                    : 0,
        };
    };

    // Calculate sums starting from top-level items (will recursively process children first)
    hierarchicalData.forEach((node) => calculateHierarchicalSums(node));

    return hierarchicalData;
}; 