'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { NoDataMessage } from './NoDataMessage';

interface DonutData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

interface DonutChartProps {
  data: DonutData[] | null;
  isPreview?: boolean;
}

// Data visualization category colors from the design system
const DATA_VIZ_COLORS = [
  'var(--e-dataviz-cat-1)', // #a683e6 (purple)
  'var(--e-dataviz-cat-2)', // #788fe8 (blue)
  'var(--e-dataviz-cat-3)', // #189ed6 (light blue)
  'var(--e-dataviz-cat-4)', // #02a785 (teal)
  'var(--e-dataviz-cat-5)', // #5fa250 (green)
  'var(--e-dataviz-cat-6)', // #a8923e (olive)
  'var(--e-dataviz-cat-7)', // #cf863a (orange)
  'var(--e-dataviz-cat-8)', // #e87482 (red)
  'var(--e-dataviz-cat-9)', // #dc74cb (pink)
  'var(--e-dataviz-cat-10)', // #8792a4 (gray)
];

export const CustomDonutChart = ({ data, isPreview = false }: DonutChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data || data.length === 0) {
      return;
    }

    // Remove any existing tooltips from both container and body
    d3.selectAll('.donut-chart-tooltip').remove();

    const updateChart = () => {
      // Clear previous content
      d3.select(svgRef.current).selectAll('*').remove();

      // Create tooltip - append to body for better visibility
      const tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'donut-chart-tooltip')
        .style('position', 'absolute')
        .style('display', 'none')
        .style('background-color', 'white')
        .style('border', '1px solid #ddd')
        .style('padding', '16px')
        .style('border-radius', '24px')
        .style('font-size', isPreview ? '12px' : '14px')
        .style('pointer-events', 'none')
        .style('z-index', '9999')
        .style('min-width', '250px')
        .style('max-width', '300px')
        .style('box-shadow', '0 4px 6px rgba(0,0,0,0.1)')
        .style('font-family', 'Rubik, sans-serif');

      // Get container dimensions
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      // Calculate responsive dimensions - use more of the available space
      const minDimension = Math.min(containerWidth, containerHeight);
      const padding = minDimension * 0.05; // Smaller padding

      // Use a larger portion of the available space
      const size = Math.max(minDimension - padding * 2, 200);
      const radius = size / 2;

      const pie = d3
        .pie<DonutData>()
        .value((d) => d.value)
        .sort(null);

      // Assign colors from the design system
      const dataWithColors = [...data];
      dataWithColors.forEach((d, i) => {
        d.color = DATA_VIZ_COLORS[i % DATA_VIZ_COLORS.length];
      });

      const pieData = pie(dataWithColors);

      const arc = d3
        .arc<d3.PieArcDatum<DonutData>>()
        .innerRadius(radius * 0.6)
        .outerRadius(radius)
        .cornerRadius(3)
        .padAngle(0.02);

      const svg = d3
        .select(svgRef.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${size + padding * 2} ${size + padding * 2}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      const g = svg
        .append('g')
        .attr('transform', `translate(${size / 2 + padding},${size / 2 + padding})`);

      // Add the arcs
      const arcs = g
        .selectAll('path')
        .data(pieData)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', (d) => d.data.color)
        .attr('stroke', 'white')
        .attr('stroke-width', 2);

      // Add hover effects with arc tween and tooltip
      arcs
        .on('mouseover', function (event, d) {
          const segment = d3.select(this);
          // Show tooltip with smart positioning to avoid going outside the window
          const tooltipWidth = 250; // Approximate width of tooltip
          const tooltipHeight = 150; // Approximate height of tooltip
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;
          const spaceOnRight = windowWidth - event.pageX;
          const spaceOnBottom = windowHeight - event.pageY;

          // Determine if tooltip should appear on left or right
          const showOnLeft = spaceOnRight < tooltipWidth + 20;

          // Determine if tooltip should appear above or below
          const showAbove = spaceOnBottom < tooltipHeight + 20;

          tooltip
            .style('display', 'block')
            .style(
              'left',
              showOnLeft ? `${event.pageX - tooltipWidth - 10}px` : `${event.pageX + 10}px`
            )
            .style(
              'top',
              showAbove ? `${event.pageY - tooltipHeight - 10}px` : `${event.pageY + 10}px`
            )
            .html(
              `<div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">${d.data.label}</div>` +
                `<div style="margin-top: 8px;">` +
                `<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">` +
                `<span style="color: #4d5c66;">Projects:</span>` +
                `<span style="font-weight: 500;">${d.data.value.toLocaleString()}</span>` +
                `</div>` +
                `<div style="display: flex; justify-content: space-between;">` +
                `<span style="color: #4d5c66;">Percentage:</span>` +
                `<span style="font-weight: 500; color: #149ef6;">${d.data.percentage.toFixed(1)}%</span>` +
                `</div>` +
                `</div>`
            );

          // Bring hovered segment to front
          const node = this as SVGPathElement;
          const parent = node.parentNode;
          if (parent) {
            parent.appendChild(node);
          }

          // Expand segment with arc tween
          segment
            .transition()
            .duration(200)
            .attrTween('d', function () {
              return function (t) {
                const interpolatedRadius = d3.interpolate(radius, radius * 1.05)(t);
                const arcGenerator = d3
                  .arc<d3.PieArcDatum<DonutData>>()
                  .innerRadius(radius * 0.6)
                  .outerRadius(interpolatedRadius)
                  .cornerRadius(3)
                  .padAngle(0.02);
                return arcGenerator(d) || '';
              };
            });

          // Dim other segments
          arcs.style('opacity', function () {
            return this === node ? 1 : 0.7;
          });
        })
        .on('mousemove', function (event) {
          // Apply the same smart positioning during mouse movement
          const tooltipWidth = 250; // Approximate width of tooltip
          const tooltipHeight = 150; // Approximate height of tooltip
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;
          const spaceOnRight = windowWidth - event.pageX;
          const spaceOnBottom = windowHeight - event.pageY;

          // Determine if tooltip should appear on left or right
          const showOnLeft = spaceOnRight < tooltipWidth + 20;

          // Determine if tooltip should appear above or below
          const showAbove = spaceOnBottom < tooltipHeight + 20;

          tooltip
            .style(
              'left',
              showOnLeft ? `${event.pageX - tooltipWidth - 10}px` : `${event.pageX + 10}px`
            )
            .style(
              'top',
              showAbove ? `${event.pageY - tooltipHeight - 10}px` : `${event.pageY + 10}px`
            );
        })
        .on('mouseout', function (_event, d) {
          // Hide tooltip immediately
          tooltip.style('display', 'none');

          const segment = d3.select(this);

          // Return segment to original size with arc tween
          segment
            .transition()
            .duration(200)
            .attrTween('d', function () {
              return function (t) {
                const interpolatedRadius = d3.interpolate(radius * 1.05, radius)(t);
                const arcGenerator = d3
                  .arc<d3.PieArcDatum<DonutData>>()
                  .innerRadius(radius * 0.6)
                  .outerRadius(interpolatedRadius)
                  .cornerRadius(3)
                  .padAngle(0.02);
                return arcGenerator(d) || '';
              };
            });

          // Restore opacity of all segments
          arcs.style('opacity', 1);
        });
    };

    // Initial render
    updateChart();

    // Add resize listener with debounce to avoid ResizeObserver loop
    let resizeTimeout: NodeJS.Timeout | null = null;
    const resizeObserver = new ResizeObserver(() => {
      // Clear previous timeout
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      // Set new timeout to debounce the resize event
      resizeTimeout = setTimeout(() => {
        d3.selectAll('.donut-chart-tooltip').remove();
        updateChart();
      }, 100);
    });

    resizeObserver.observe(containerRef.current);

    // Cleanup
    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeObserver.disconnect();
      d3.selectAll('.donut-chart-tooltip').remove();
    };
  }, [data, isPreview]);

  // If there's no data, show the NoDataMessage component
  if (!data || data.length === 0) {
    return <NoDataMessage isPreview={isPreview} message="No data available for donut chart" />;
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        maxHeight: isPreview ? '80vh' : '100%', // Add max-height constraint for initial view
      }}
    >
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};
