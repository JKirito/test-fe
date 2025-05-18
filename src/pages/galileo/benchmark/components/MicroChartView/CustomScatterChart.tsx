'use client';

import { getLinePoints, Point, calculateLinearRegression } from '@/lib/utils/regression';
import * as d3 from 'd3';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { NoDataMessage } from './NoDataMessage';

interface ScatterplotData {
  gfa: number;
  planned: number;
  actual: number;
  projectId: string;
  metric: string;
}

interface ScatterplotChartProps {
  data: ScatterplotData[] | null;
  isPreview?: boolean;
}

// Define point colors
const POINT_COLORS = {
  planned: '#00aeef',
  actual: '#ff6b6b',
} as const;

export const CustomScatterChart: React.FC<ScatterplotChartProps> = ({
  data,
  isPreview = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Remove excessive logging that could cause performance issues
  // // console.log('CustomScatterChart: isPreview', isPreview);

  useLayoutEffect(() => {
    if (!svgRef.current || !containerRef.current || !data || data.length === 0) {
      return;
    }

    // Create a stable tooltip reference
    // First, remove any orphaned tooltips that might exist from previous renders
    const existingTooltips = d3
      .select('body')
      .selectAll<HTMLDivElement, unknown>('.scatter-chart-tooltip');
    if (existingTooltips.size() > 1) {
      // Keep only the first one and remove others to avoid duplicates
      existingTooltips
        .nodes()
        .slice(1)
        .forEach((node) => node.remove());
    }

    // Get or create the tooltip
    let tooltip = d3.select('body').select<HTMLDivElement>('.scatter-chart-tooltip');
    if (tooltip.empty()) {
      tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'scatter-chart-tooltip')
        .style('position', 'absolute')
        .style('z-index', '999999')
        .style('background-color', 'white')
        .style('border', '1px solid #ddd')
        .style('padding', '16px')
        .style('border-radius', '24px')
        .style('font-size', isPreview ? '12px' : '14px')
        .style('pointer-events', 'none')
        .style('min-width', '250px')
        .style('max-width', '300px')
        .style('box-shadow', '0 4px 6px rgba(0,0,0,0.1)')
        .style('font-family', 'var(--e-font-family-rubik)')
        .style('opacity', '0') // Start with opacity 0 instead of display none
        .style('transition', 'opacity 0.15s'); // Add smooth transition
    }

    // Don't hide at start - we'll control visibility with opacity instead of display

    // Helper function to apply consistent font styling to axis labels
    const applyAxisLabelStyles = (selection: d3.Selection<any, any, any, any>, isXAxis = true) => {
      selection
        .style('font-family', 'Rubik')
        .style('font-size', isPreview ? '12px' : '14px')
        .style('fill', isXAxis ? '#77868F' : '#0F1214');
    };

    const updateChart = () => {
      // Clear previous content
      d3.select(svgRef.current).selectAll('*').remove();

      // Get container dimensions and use actual container height
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      const baseWidth = containerRect.width;
      const baseHeight = containerRect.height;
      const margin = isPreview
        ? { top: 20, right: 20, bottom: 40, left: 60 }
        : { top: 40, right: 40, bottom: 60, left: 80 };

      // Ensure we use the full width available
      const width = Math.max(baseWidth - margin.left - margin.right, 300);

      // Calculate height based on container and fullscreen state
      let height;
      if (isPreview) {
        // In preview mode, use a fixed height
        height = 300 - margin.top - margin.bottom;
      } else {
        // In fullscreen mode, use the full container height
        // Use the actual container height without any minimum
        height = baseHeight - margin.top - margin.bottom;
      }

      // Create SVG with responsive dimensions
      const svg = d3
        .select(svgRef.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr(
          'viewBox',
          `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
        )
        .attr('preserveAspectRatio', 'xMidYMid meet');

      // Create main group
      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      // Add zoom rect (for x-axis zoom and panning)
      const zoomRect = g
        .append('rect')
        .attr('class', 'zoom-rect')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .style('touch-action', 'pan-y pinch-zoom');

      // Create scales with strict zero minimum
      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data as ScatterplotData[], (d) => d.gfa) || 0])
        .range([height, 0])
        .nice();

      const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(data as ScatterplotData[], (d) => Math.max(d.planned, d.actual)) || 0])
        .range([0, width])
        .nice();

      // Add clip path to constrain rendering within plot area
      const clipId = `clip-${Math.random().toString(36).substring(2)}`;
      svg
        .append('defs')
        .append('clipPath')
        .attr('id', clipId)
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height);

      // Create a group for the plot area with clip path
      const plotArea = g.append('g').attr('clip-path', `url(#${clipId})`);

      // Add grid lines (Y grid)
      g.append('g')
        .attr('class', 'grid')
        .selectAll('line')
        .data(yScale.ticks(5))
        .enter()
        .append('line')
        .attr('class', 'y-grid')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', (d) => yScale(d))
        .attr('y2', (d) => yScale(d))
        .attr('stroke', '#e5e7eb')
        .attr('stroke-dasharray', '5,5');

      // Add grid lines (X grid)
      g.append('g')
        .attr('class', 'grid')
        .selectAll('line')
        .data(xScale.ticks(5))
        .enter()
        .append('line')
        .attr('class', 'x-grid')
        .attr('x1', (d) => xScale(d))
        .attr('x2', (d) => xScale(d))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#e5e7eb')
        .attr('stroke-dasharray', '5,5');

      // Update scales with padded domains for better view
      const minDuration =
        d3.min(data as ScatterplotData[], (d) => Math.min(d.planned, d.actual)) || 0;
      const maxDuration =
        d3.max(data as ScatterplotData[], (d) => Math.max(d.planned, d.actual)) || 0;
      const minGFA = d3.min(data as ScatterplotData[], (d) => d.gfa) || 0;
      const maxGFA = d3.max(data as ScatterplotData[], (d) => d.gfa) || 0;

      const xPadding = (((maxDuration as number) - minDuration) as number) * 0.15;
      const yPadding = (((maxGFA as number) - minGFA) as number) * 0.15;

      const paddedMinX = Math.max(0, (minDuration as number) - xPadding);
      const paddedMaxX = (maxDuration as number) + xPadding;
      const paddedMaxY = (maxGFA as number) + yPadding;

      xScale.domain([paddedMinX, paddedMaxX]);
      yScale.domain([0, paddedMaxY]);

      // Calculate regression lines for planned and actual
      const plannedPoints: Point[] = data.map((d) => ({ x: d.planned, y: d.gfa }));
      const actualPoints: Point[] = data.map((d) => ({ x: d.actual, y: d.gfa }));

      const plannedRegression = calculateLinearRegression(plannedPoints);
      const actualRegression = calculateLinearRegression(actualPoints);

      const plannedLinePoints = getLinePoints(plannedRegression, {
        min: paddedMinX,
        max: paddedMaxX,
      });
      const actualLinePoints = getLinePoints(actualRegression, {
        min: paddedMinX,
        max: paddedMaxX,
      });

      // Add regression line for planned (dashed)
      plotArea
        .append('line')
        .attr('class', 'regression-line planned')
        .attr('x1', xScale(plannedLinePoints[0].x))
        .attr('y1', yScale(plannedLinePoints[0].y))
        .attr('x2', xScale(plannedLinePoints[1].x))
        .attr('y2', yScale(plannedLinePoints[1].y))
        .attr('stroke', POINT_COLORS.planned)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .style('opacity', 0.7);

      // Add regression line for actual (dashed)
      plotArea
        .append('line')
        .attr('class', 'regression-line actual')
        .attr('x1', xScale(actualLinePoints[0].x))
        .attr('y1', yScale(actualLinePoints[0].y))
        .attr('x2', xScale(actualLinePoints[1].x))
        .attr('y2', yScale(actualLinePoints[1].y))
        .attr('stroke', POINT_COLORS.actual)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .style('opacity', 0.7);

      // Add scatter points for planned duration
      plotArea
        .selectAll('.planned-point')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'planned-point')
        .attr('cx', (d) => xScale(d.planned))
        .attr('cy', (d) => yScale(d.gfa))
        .attr('r', isPreview ? 6 : 8)
        .attr('fill', POINT_COLORS.planned)
        .attr('stroke', 'white')
        .attr('stroke-width', 2);

      // Add scatter points for actual duration
      plotArea
        .selectAll('.actual-point')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'actual-point')
        .attr('cx', (d) => xScale(d.actual))
        .attr('cy', (d) => yScale(d.gfa))
        .attr('r', isPreview ? 6 : 8)
        .attr('fill', POINT_COLORS.actual)
        .attr('stroke', 'white')
        .attr('stroke-width', 2);

      // Add X axis with better positioning
      const xAxis = g
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5));

      // Style x-axis and its label
      applyAxisLabelStyles(xAxis.selectAll('text'), true);

      // Add X axis label
      g.append('text')
        .attr('class', 'x-axis-label')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Rubik')
        .style('font-size', isPreview ? '12px' : '14px')
        .style('fill', '#77868F')
        .text('Duration (months)');

      // Add Y axis
      const yAxis = g.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScale).ticks(5));

      // Style y-axis and its label
      applyAxisLabelStyles(yAxis.selectAll('text'), false);

      // Add Y axis label
      g.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 10)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Rubik')
        .style('font-size', isPreview ? '12px' : '14px')
        .style('fill', '#0F1214')
        .text('GFA (sqm)');

      // Define the tooltip event handler function
      const addTooltipEvents = (selection: d3.Selection<any, any, any, any>) => {
        // First remove any existing event listeners to prevent duplicates
        selection.on('mouseover', null).on('mousemove', null).on('mouseout', null);

        // Then add new event listeners
        selection
          .on('mouseover', function (event, d: any) {
            // Stop event propagation to prevent parent elements from triggering mouseout
            event.stopPropagation();

            const point = d3.select(this);

            // Calculate differences and percentages
            const diff = d.actual - d.planned;
            const percentDiff = ((diff / d.planned) * 100).toFixed(1);
            const durationVariance = Math.abs(diff);
            const efficiencyScore = (d.gfa / d.actual).toFixed(2);
            const plannedEfficiency = (d.gfa / d.planned).toFixed(2);

            // Format numbers for display
            const formattedGFA = d.gfa.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            });
            const formattedPlanned = d.planned.toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            });
            const formattedActual = d.actual.toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            });

            // Calculate tooltip position with smart positioning
            const tooltipWidth = 250;
            const tooltipHeight = 200;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const spaceOnRight = windowWidth - event.pageX;
            const spaceOnBottom = windowHeight - event.pageY;

            // Determine if tooltip should appear on left or right
            const showOnLeft = spaceOnRight < tooltipWidth + 20;

            // Determine if tooltip should appear above or below
            const showAbove = spaceOnBottom < tooltipHeight + 20;

            // Show tooltip with detailed metrics
            tooltip
              .style('opacity', '1') // Use opacity instead of display
              .style(
                'left',
                showOnLeft ? `${event.pageX - tooltipWidth - 10}px` : `${event.pageX + 10}px`
              )
              .style(
                'top',
                showAbove ? `${event.pageY - tooltipHeight - 10}px` : `${event.pageY + 10}px`
              )
              .html(
                `<div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">Project ID - ${d.projectId}</div>` +
                  `<div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">Project Name - ${d.projectName}</div>` +
                  `<div style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">Project Metrics</div>` +
                  `<div style="display: flex; flex-direction: column; gap: 8px;">` +
                  `<div style="display: flex; justify-content: space-between;">` +
                  `<span style="color: #4b5563;">GFA:</span>` +
                  `<span style="font-weight: 500;">${formattedGFA} sqm</span>` +
                  `</div>` +
                  `<div style="display: flex; justify-content: space-between;">` +
                  `<span style="color: #4b5563;">Planned Duration:</span>` +
                  `<span style="font-weight: 500;">${formattedPlanned} ${d.metric}</span>` +
                  `</div>` +
                  `<div style="display: flex; justify-content: space-between;">` +
                  `<span style="color: #4b5563;">Actual Duration:</span>` +
                  `<span style="font-weight: 500;">${formattedActual} ${d.metric}</span>` +
                  `</div>` +
                  `<div style="display: flex; justify-content: space-between;">` +
                  `<span style="color: #4b5563;">Variance:</span>` +
                  `<span style="font-weight: 500; color: ${diff >= 0 ? '#ff6b6b' : '#4caf50'};">` +
                  `${diff >= 0 ? '+' : ''}${durationVariance.toFixed(1)} ${d.metric} (${diff >= 0 ? '+' : ''}${percentDiff}%)` +
                  `</span>` +
                  `</div>` +
                  `<div style="display: flex; justify-content: space-between;">` +
                  `<span style="color: #4b5563;">Planned Efficiency:</span>` +
                  `<span style="font-weight: 500;">${plannedEfficiency} sqm/day</span>` +
                  `</div>` +
                  `<div style="display: flex; justify-content: space-between;">` +
                  `<span style="color: #4b5563;">Actual Efficiency:</span>` +
                  `<span style="font-weight: 500;">${efficiencyScore} sqm/day</span>` +
                  `</div>` +
                  `</div>`
              );

            // Increase point size on hover
            point
              .attr('r', isPreview ? 9 : 12)
              .attr('stroke-width', 3)
              .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');
          })
          .on('mousemove', function (event) {
            // Stop event propagation
            event.stopPropagation();

            // Calculate tooltip position with smart positioning
            const tooltipWidth = 250;
            const tooltipHeight = 200;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const spaceOnRight = windowWidth - event.pageX;
            const spaceOnBottom = windowHeight - event.pageY;

            // Determine if tooltip should appear on left or right
            const showOnLeft = spaceOnRight < tooltipWidth + 20;

            // Determine if tooltip should appear above or below
            const showAbove = spaceOnBottom < tooltipHeight + 20;

            // Position tooltip with smart positioning
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
          .on('mouseout', function (event) {
            // Stop event propagation
            event.stopPropagation();

            // Use opacity instead of display none for smoother transitions
            tooltip.style('opacity', '0');

            d3.select(this)
              .attr('r', isPreview ? 6 : 8)
              .attr('stroke-width', 2)
              .style('filter', null);
          });
      };

      // Apply tooltip events to points
      addTooltipEvents(plotArea.selectAll('.planned-point, .actual-point'));

      // Add zoom behavior for x-axis panning and zooming
      const zoom = d3
        .zoom()
        .scaleExtent([0.2, 8])
        .extent([
          [0, 0],
          [width, height],
        ])
        .on('zoom', (event) => {
          const newXScale = event.transform.rescaleX(xScale);

          // Update x-axis with smooth transition
          xAxis
            .transition()
            .duration(100)
            .ease(d3.easeLinear)
            .call(d3.axisBottom(newXScale).ticks(5) as any)
            // Apply consistent font styling to the updated tick labels
            .on('end', () => {
              // Apply the same font styling to ensure consistency
              applyAxisLabelStyles(xAxis.selectAll('text'), true);
            });

          // Update point positions
          plotArea.selectAll('.planned-point').attr('cx', (d: any) => newXScale(d.planned));
          plotArea.selectAll('.actual-point').attr('cx', (d: any) => newXScale(d.actual));

          // Update regression lines
          plotArea
            .select('.regression-line.planned')
            .attr('x1', newXScale(plannedLinePoints[0].x))
            .attr('x2', newXScale(plannedLinePoints[1].x));
          plotArea
            .select('.regression-line.actual')
            .attr('x1', newXScale(actualLinePoints[0].x))
            .attr('x2', newXScale(actualLinePoints[1].x));

          // Update grid lines
          g.selectAll('.grid line.x-grid')
            .transition()
            .duration(100)
            .ease(d3.easeLinear)
            .attr('x1', (d: any) => newXScale(d))
            .attr('x2', (d: any) => newXScale(d));
        });

      // Apply zoom behavior to the zoom rect
      zoomRect.call(zoom as any);

      // Double-click to reset zoom
      zoomRect.on('dblclick', () => {
        zoomRect
          .transition()
          .duration(400)
          .ease(d3.easeCubicInOut)
          .call(zoom.transform as any, d3.zoomIdentity)
          .on('end', () => {
            // Ensure consistent font styling after zoom reset
            applyAxisLabelStyles(xAxis.selectAll('text'), true);
          });
      });

      // Make scatter points pointer-events visible
      plotArea
        .selectAll('.planned-point, .actual-point')
        .style('pointer-events', 'visible')
        .style('cursor', 'pointer');
    };

    updateChart();

    // Add resize listener with ResizeObserver
    let resizeTimeout: NodeJS.Timeout | null = null;
    const resizeObserver = new ResizeObserver((entries) => {
      // Clear previous timeout
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      // Get the new dimensions
      const entry = entries[0];
      const newWidth = entry.contentRect.width;
      const newHeight = entry.contentRect.height;

      // Set new timeout to debounce the resize event
      resizeTimeout = setTimeout(() => {
        // Only update if dimensions have actually changed
        if (newWidth > 0 && (isPreview || newHeight > 0)) {
          // Don't remove the tooltip, just hide it temporarily during chart update
          d3.select('.scatter-chart-tooltip').style('opacity', '0');
          updateChart();
        }
      }, 100);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Create a more robust cleanup function
    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeObserver.disconnect();

      // Don't remove the tooltip on component unmount if it's being reused
      // Just hide it with opacity to avoid flicker on remount
      tooltip.style('opacity', '0');

      // Add a small delay before actually hiding it to prevent flicker during transitions
      setTimeout(() => {
        // Only hide if component is truly unmounted (check if tooltip still exists)
        const tooltipElement = document.querySelector('.scatter-chart-tooltip');
        if (tooltipElement && !document.contains(svgRef.current)) {
          tooltip.style('opacity', '0');
        }
      }, 50);
    };
  }, [data, isPreview]);

  // If there's no data, show the NoDataMessage component
  if (!data || data.length === 0) {
    return <NoDataMessage isPreview={isPreview} message="No data available for scatter chart" />;
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center relative overflow-visible ${isPreview ? '' : 'fullscreen-chart'}`}
      style={{
        height: '100%', // Always take 100% of parent height
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'default',
        minHeight: isPreview ? '350px' : '100%', // 100% in fullscreen mode
        maxHeight: isPreview ? '350px' : 'none',
        flex: 1, // Always use flex: 1 to take available space
      }}
    >
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};
