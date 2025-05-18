import { HowToWithChildren } from '@/einstein/components/admin/howTo/types/howTo.types.ts';

/**
 * Recursively finds a HowTo item by its ID within a tree structure.
 */
export const findHowToById = (nodes: HowToWithChildren[], id: string): HowToWithChildren | null => {
  for (const node of nodes) {
    if (node._id === id) {
      return node;
    }
    if (node.children) {
      const foundInChildren = findHowToById(node.children, id);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }
  return null;
};

/**
 * Represents the data structure for a quick link.
 */
export interface QuickLinkInfo {
  id: string;
  title: string;
  depth: number;
}

/**
 * Recursively collects link data for all descendants of a HowTo item.
 */
export const getAllDescendantLinks = (
  node: HowToWithChildren | null,
  currentDepth: number = 0
): QuickLinkInfo[] => {
  if (!node || !node.children || node.children.length === 0) {
    return [];
  }

  let links: QuickLinkInfo[] = [];

  // Use the pre-sorted children from the node itself
  const sortedChildren = node.children; // Assume children are already sorted

  for (const child of sortedChildren) {
    if (child._id && child.title) {
      links.push({ id: child._id, title: child.title, depth: currentDepth });
      // Recursively get links from the child's descendants
      links = links.concat(getAllDescendantLinks(child, currentDepth + 1));
    }
  }

  return links;
};
