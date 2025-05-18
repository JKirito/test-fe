'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { NoDataMessage } from './NoDataMessage';

interface BarData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

interface BarChartProps {
  data: BarData[] | null;
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

export const CustomBarChart = ({ data, isPreview = false }: BarChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data || data.length === 0) {
      return;
    }

    // Remove any existing tooltips
    d3.selectAll('.chart-tooltip').remove();

    const updateChart = () => {
      // Clear previous content
      d3.select(svgRef.current).selectAll('*').remove();

      // Create tooltip - append to body instead of container for better visibility
      const tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'chart-tooltip')
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
      const containerRect = containerRef.current?.getBoundingClientRect();
      const containerWidth = containerRect?.width || 0;
      const containerHeight = containerRect?.height || 0;

      // Calculate responsive dimensions with increased bottom margin for x-axis labels
      const margin = { top: 40, right: 30, bottom: 100, left: 60 };
      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;

      // Create SVG
      const svg = d3
        .select(svgRef.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      // Define a clip path to prevent content from overflowing
      svg
        .append('defs')
        .append('clipPath')
        .attr('id', 'chart-clip')
        .append('rect')
        .attr('width', width)
        .attr('height', height);

      // Create main group with clip path
      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .attr('clip-path', 'url(#chart-clip)');

      // Create a group for the content that will be panned
      const contentGroup = g.append('g').attr('class', 'content-group');

      // Sort data by value in descending order
      const sortedData = [...data].sort((a, b) => b.value - a.value);

      // Assign colors from the design system
      sortedData.forEach((d, i) => {
        d.color = DATA_VIZ_COLORS[i % DATA_VIZ_COLORS.length];
      });

      // Create scales
      // Calculate the minimum width needed for all bars (70px per bar with padding)
      const minBarWidth = 70;
      const totalPadding = 0.3; // 30% padding between bars
      const minWidthNeeded = sortedData.length * (minBarWidth / (1 - totalPadding));

      // Use the larger of the container width or the minimum width needed
      const chartWidth = Math.max(width, minWidthNeeded);

      const xScale = d3
        .scaleBand()
        .domain(sortedData.map((d) => d.label))
        .range([0, chartWidth])
        .padding(totalPadding);

      // Find the maximum percentage value in the data
      const maxPercentage = d3.max(sortedData, (d) => d.percentage) || 0;
      // Add a little padding (10%) to the top of the scale for better visualization
      const yDomainMax = Math.min(Math.ceil(maxPercentage * 1.1), 100);

      const yScale = d3
        .scaleLinear()
        .domain([0, yDomainMax]) // Scale from 0 to max percentage (with padding)
        .range([height, 0])
        .nice();

      // Add X axis (outside the clip path)
      const xAxisGroup = svg
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(${margin.left},${height + margin.top})`)
        .call(d3.axisBottom(xScale));

      // Style the x-axis labels
      xAxisGroup
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .style('font-family', 'Rubik')
        .style('font-size', '14px')
        .style('color', '#77868F');

      // Add Y axis (outside the clip path)
      svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .call(
          d3
            .axisLeft(yScale)
            .ticks(5)
            .tickFormat((d) => `${d}%`)
        )
        .selectAll('text')
        .style('font-family', 'Rubik')
        .style('font-size', '14px')
        .style('color', '#77868F');

      // // Add Y axis label
      // g.append('text')
      //   .attr('transform', 'rotate(-90)')
      //   .attr('y', -margin.left + 20)
      //   .attr('x', -height / 2)
      //   .attr('dy', '1em')
      //   .style('text-anchor', 'middle')
      //   .style('font-family', 'Poppins')
      //   .style('font-size', '14px')
      //   .text('Percentage of Projects (0-' + yDomainMax + '%)');

      // Add a horizontal grid for better readability (inside the content group)
      contentGroup
        .append('g')
        .attr('class', 'grid')
        .call(
          d3
            .axisLeft(yScale)
            .ticks(5)
            .tickSize(-chartWidth) // Use chartWidth instead of width
            .tickFormat(() => '')
        )
        .selectAll('line')
        .style('stroke', '#e5e9eb')
        .style('stroke-opacity', 0.7)
        .style('shape-rendering', 'crispEdges');

      // Remove the domain line of the grid
      contentGroup.selectAll('.grid .domain').style('display', 'none');

      // Add X axis label
      // g.append('text')
      //   .attr('x', width / 2)
      //   .attr('y', height + margin.bottom - 10)
      //   .attr('text-anchor', 'middle')
      //   .style('font-family', 'Poppins')
      //   .style('font-size', '14px')
      //   .text('Industry Type');

      // Add bars (inside the content group)
      const bars = contentGroup
        .selectAll('.bar')
        .data(sortedData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(d.label) || 0)
        .attr('width', xScale.bandwidth())
        .attr('y', (d) => yScale(d.percentage)) // Use percentage for y-axis
        .attr('height', (d) => height - yScale(d.percentage))
        .attr('fill', (d) => d.color)
        .attr('rx', 16)
        .attr('ry', 16);

      // We're not displaying percentage numbers on top of the bars anymore

      // Add hover effects and tooltip
      bars
        .on('mouseover', function (event, d) {
          // Highlight bar
          d3.select(this).transition().duration(200).attr('opacity', 0.8);

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
              `<div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">${d.label}</div>` +
                `<div style="margin-top: 8px;">` +
                `<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">` +
                `<span style="color: #4d5c66;">Projects:</span>` +
                `<span style="font-weight: 500;">${d.value.toLocaleString()}</span>` +
                `</div>` +
                `<div style="display: flex; justify-content: space-between;">` +
                `<span style="color: #4d5c66;">Percentage:</span>` +
                `<span style="font-weight: 500; color: #149ef6;">${d.percentage.toFixed(1)}%</span>` +
                `</div>` +
                `</div>`
            );
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
        .on('mouseout', function () {
          // Restore original opacity
          d3.select(this).transition().duration(200).attr('opacity', 1);

          // Hide tooltip
          tooltip.style('display', 'none');
        });

      // Only add panning if the chart is wider than the container
      if (chartWidth > width) {
        // Create a simpler drag behavior instead of zoom
        let dragStartX = 0;
        let currentTranslateX = 0;
        const maxTranslateX = 0;
        const minTranslateX = -(chartWidth - width);

        const drag = d3
          .drag()
          .on('start', function (event) {
            dragStartX = event.x;
            d3.select(this).style('cursor', 'grabbing');
          })
          .on('drag', function (event) {
            // Calculate new position
            let newTranslateX = currentTranslateX + (event.x - dragStartX);

            // Constrain to bounds
            newTranslateX = Math.min(maxTranslateX, Math.max(minTranslateX, newTranslateX));

            // Apply translation to content group
            contentGroup.attr('transform', `translate(${newTranslateX},0)`);

            // Move x-axis with content
            const xAxisGroup = svg.select('.x-axis');
            if (!xAxisGroup.empty()) {
              xAxisGroup.attr(
                'transform',
                `translate(${margin.left + newTranslateX},${height + margin.top})`
              );
            }
          })
          .on('end', function (event) {
            // Update current position
            currentTranslateX = currentTranslateX + (event.x - dragStartX);
            currentTranslateX = Math.min(maxTranslateX, Math.max(minTranslateX, currentTranslateX));
            d3.select(this).style('cursor', 'grab');
          });

        // Apply drag behavior to the SVG
        svg.call(drag as any);

        // Add visual indicator for dragging
        svg
          .append('text')
          .attr('x', containerWidth / 2)
          .attr('y', containerHeight - 10)
          .attr('text-anchor', 'middle')
          .style('font-family', 'Rubik')
          .style('font-size', '12px')
          .style('fill', '#77868F')
          .text('← Drag to scroll horizontally →');
      }

      // No need for additional indicator as we already added one above
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
        d3.selectAll('.chart-tooltip').remove();
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
      d3.selectAll('.chart-tooltip').remove();
    };
  }, [data, isPreview]);

  // If there's no data, show the NoDataMessage component
  if (!data || data.length === 0) {
    return <NoDataMessage isPreview={isPreview} message="No data available for bar chart" />;
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'visible', // Allow content to overflow for panning
        cursor: 'grab', // Show grab cursor to indicate panning is available
      }}
    >
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};
