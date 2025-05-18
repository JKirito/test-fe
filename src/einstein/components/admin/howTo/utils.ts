import { HowToWithChildren } from './types/howTo.types';

/**
 * Sorts an array of HowToWithChildren items recursively based on the 'order' property.
 * Uses natural sorting for strings containing numbers.
 * Items without an 'order' property are placed last.
 *
 * @param nodes The array of HowToWithChildren nodes to sort.
 * @returns A new array containing the sorted nodes.
 */
export const sortHowTosRecursively = (nodes: HowToWithChildren[]): HowToWithChildren[] => {
  if (!nodes) return [];

  // Create a shallow copy to avoid mutating the original array
  const sortedNodes = [...nodes].sort((a, b) => {
    const orderA = a.order;
    const orderB = b.order;

    // Handle cases where order is undefined or null, placing them last
    if (orderA === undefined || orderA === null) return 1; // a comes after b
    if (orderB === undefined || orderB === null) return -1; // b comes after a

    // Use localeCompare for natural sorting of alphanumeric strings
    return String(orderA).localeCompare(String(orderB), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });

  // Recursively sort children
  return sortedNodes.map((node) => ({
    ...node,
    children: node.children ? sortHowTosRecursively(node.children) : undefined,
  }));
};

export const buildHierarchy = (items: HowTo[]): HowToWithChildren[] => {
  const map = new Map<string, HowToWithChildren>();
  const roots: HowToWithChildren[] = [];

  // First pass: create map and init children
  items.forEach((item) => {
    map.set(item._id, { ...item, children: [] });
  });

  // Second pass: assign children to parents
  items.forEach((item) => {
    if (item.parentId) {
      const parent = map.get(item.parentId);
      if (parent) {
        parent.children!.push(map.get(item._id)!);
      }
    } else {
      roots.push(map.get(item._id)!);
    }
  });

  return roots;
};
