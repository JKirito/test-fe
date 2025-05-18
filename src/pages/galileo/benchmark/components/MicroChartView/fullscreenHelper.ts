/**
 * Helper function to force a resize event after a delay
 * This helps charts redraw properly when toggling fullscreen mode
 * Optimized to reduce the number of resize events to prevent tooltip flickering
 */
export const forceResize = (delay: number = 300) => {
  // Create and dispatch a resize event immediately
  const resizeEvent = new Event('resize');
  window.dispatchEvent(resizeEvent);

  // Create a reduced sequence of resize events with increasing delays
  // Using fewer events to minimize tooltip flickering while still ensuring proper chart redraw
  const delays = [100, 300, delay];

  const timeoutIds = delays.map((d) =>
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, d)
  );

  // Add a final resize event with RAF for smoother rendering
  const rafId = requestAnimationFrame(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, delay + 100);
  });

  // Return a cleanup function to clear all timeouts
  return () => {
    timeoutIds.forEach((id) => clearTimeout(id));
    cancelAnimationFrame(rafId);
  };
};
