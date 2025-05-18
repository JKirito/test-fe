'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

interface BarData {
  stage: string;
  planned: number;
  actual: number;
  label: string;
  color: string;
  metric: string;
}

interface BarChartProps {
  data: BarData[] | null;
  chartType?: string;
  isPreview?: boolean;
  phaseColors?: {
    design: string;
    planningApproval: string;
    procurement: string;
    construction: string;
  };
  useRoundedCorners?: boolean;
  cornerRadius?: number;
  xAxisLabel?: string;
  rotateLabels?: boolean;
}

const POINT_COLORS = {
  planned: '#00aeef',
  actual: '#ff6b6b',
} as const;

// Default phase colors if not provided
const DEFAULT_PHASE_COLORS = {
  design: '#E5BE27',
  planningApproval: '#4F4DD0',
  procurement: '#DC74CB',
  construction: '#02A785',
};

export const CustomBarChartWithPhases: React.FC<BarChartProps> = ({
  data,
  chartType = 'spike',
  isPreview = false,
  phaseColors = DEFAULT_PHASE_COLORS,
  useRoundedCorners = true,
  cornerRadius = 12,
  xAxisLabel = 'Duration (months)',
  rotateLabels = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to get color based on stage name
  const getPhaseColor = (stage: string) => {
    const stageLower = stage.toLowerCase();
    if (stageLower.includes('design')) return phaseColors.design;
    if (stageLower.includes('planning') || stageLower.includes('approval'))
      return phaseColors.planningApproval;
    if (stageLower.includes('procurement')) return phaseColors.procurement;
    if (stageLower.includes('construction')) return phaseColors.construction;
    return '#8792a4'; // Default color if no match
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data || data.length === 0) {
      return;
    }

    // Create a stable tooltip reference
    // First, remove any orphaned tooltips that might exist from previous renders
    const existingTooltips = d3
      .select('body')
      .selectAll<HTMLDivElement, unknown>('.bar-chart-tooltip');
    if (existingTooltips.size() > 1) {
      // Keep only the first one and remove others to avoid duplicates
      existingTooltips
        .nodes()
        .slice(1)
        .forEach((node) => node.remove());
    }

    // Get or create the tooltip
    let tooltip = d3.select('body').select<HTMLDivElement>('.bar-chart-tooltip');
    if (tooltip.empty()) {
      tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'bar-chart-tooltip')
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

    const updateChart = () => {
      // Clear previous content
      d3.select(svgRef.current).selectAll('*').remove();

      // Get container dimensions and use actual container height
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      const baseWidth = containerRect.width;
      const baseHeight = containerRect.height;
      const margin = isPreview
        ? { top: 20, right: 40, bottom: 40, left: 100 }
        : { top: 40, right: 100, bottom: 80, left: 180 };
      const width = Math.max(baseWidth - margin.left - margin.right, 300);

      // For fullscreen mode, use a larger minimum height
      const minHeight = isPreview ? 300 : 500;
      const height = Math.max(baseHeight - margin.top - margin.bottom, minHeight);

      // Create SVG with responsive dimensions
      const svg = d3
        .select(svgRef.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${baseWidth} ${baseHeight}`)
        .attr('preserveAspectRatio', isPreview ? 'xMinYMin meet' : 'xMidYMid meet');

      // Create main group
      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      // Create scales
      const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => Math.max(d.planned, d.actual)) || 0])
        .range([0, width]);

      const yScale = d3
        .scaleBand()
        .domain(data.map((d) => d.stage))
        .range([0, height])
        .padding(0.3);

      const subYScale = d3
        .scaleBand()
        .domain(['planned', 'actual'])
        .range([0, yScale.bandwidth()])
        .padding(0.1);

      // Create groups for each stage
      const stageGroups = g
        .selectAll('.stage-group')
        .data(data)
        .join('g')
        .attr('class', 'stage-group')
        .attr('transform', (d) => `translate(0,${yScale(d.stage)!})`);

      // Add Y axis
      g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale))
        .selectAll('.domain, .tick line')
        .remove();

      // Style y-axis labels with word wrapping
      g.selectAll('.y-axis .tick text').remove(); // Remove default text

      // Add custom text elements with word wrapping
      g.selectAll('.y-axis .tick')
        .append('foreignObject')
        .attr('width', margin.left - 10) // Fixed width for the text
        .attr('height', 60) // Height to accommodate multiple lines
        .attr('x', -margin.left + 10) // Position to the left of the axis
        .attr('y', -30) // Center vertically
        .append('xhtml:div')
        .style('font-family', 'Rubik')
        .style('font-size', isPreview ? '12px' : '14px')
        .style('font-weight', '400')
        .style('color', '#0F1214')
        .style('line-height', '1.2')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('justify-content', 'flex-end')
        .style('text-align', 'right')
        .style('height', '100%')
        .style('padding-right', '10px')
        .html(function (d) {
          return String(d);
        });

      // Add X axis
      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height - 20})`)
        .call(d3.axisBottom(xScale).ticks(5));

      // Style x-axis
      g.selectAll('.x-axis text')
        .style('font-family', 'Rubik')
        .style('font-size', isPreview ? '12px' : '14px')
        .style('color', '#77868F');

      // Apply rotation to x-axis labels if rotateLabels is true
      if (rotateLabels) {
        g.selectAll('.x-axis text')
          .attr('transform', 'rotate(-30)')
          .style('text-anchor', 'end')
          .attr('dx', '-.8em')
          .attr('dy', '.15em');
      }

      // Create a temporary text element to measure the actual width of the x-axis label
      const tempText = g
        .append('text')
        .attr('class', 'temp-measure')
        .style('font-family', 'Rubik')
        .style('font-size', isPreview ? '12px' : '14px')
        .style('visibility', 'hidden')
        .text(xAxisLabel);

      // Get the computed width of the text
      const textWidth = tempText.node()?.getBBox().width || xAxisLabel.length * (isPreview ? 7 : 9);

      // Remove the temporary text element
      tempText.remove();

      // Add a white background rectangle for the x-axis label with padding
      const padding = isPreview ? 10 : 16;

      // Add a filter for the shadow effect
      // Create a unique ID for the filter to avoid conflicts with multiple charts
      const filterId = `shadow-${Math.random().toString(36).substring(2, 9)}`;
      const defs = svg.append('defs');
      const filter = defs
        .append('filter')
        .attr('id', filterId)
        .attr('x', '-20%')
        .attr('y', '-20%')
        .attr('width', '140%')
        .attr('height', '140%');

      filter
        .append('feDropShadow')
        .attr('dx', 0)
        .attr('dy', 1)
        .attr('stdDeviation', 1)
        .attr('flood-opacity', 0.2);

      g.append('rect')
        .attr('class', 'x-axis-label-bg')
        .attr('x', width / 2 - textWidth / 2 - padding / 2)
        .attr('y', height + (isPreview ? 10 : 10))
        .attr('width', textWidth + padding)
        .attr('height', isPreview ? 20 : 24)
        .attr('fill', 'white')
        .attr('stroke', '#f5f5f5')
        .attr('stroke-width', 1)
        .attr('rx', 4)
        .attr('ry', 4)
        .style('filter', `url(#${filterId})`);

      // Add X axis label
      g.append('text')
        .attr('class', 'x-axis-label')
        .attr('x', width / 2)
        .attr('y', height + (isPreview ? 23 : 25))
        .attr('text-anchor', 'middle')
        .style('font-family', 'Rubik')
        .style('font-size', isPreview ? '12px' : '14px')
        .style('font-weight', '400')
        .style('fill', '#77868F')
        .text(xAxisLabel);

      // Grid lines removed as requested

      // Assign phase colors to data
      data.forEach((d) => {
        d.color = getPhaseColor(d.stage);
      });

      // Create variables to store chart elements for tooltip events
      let barElements: d3.Selection<any, any, any, any> | null = null;

      // Render different views based on chartType
      switch (chartType) {
        case 'bar':
          // Render bars for stacked view

          // Render bars
          barElements = stageGroups
            .selectAll('.bar')
            .data((d) => [
              {
                type: 'planned',
                value: d.planned,
                color: POINT_COLORS.planned,
                stage: d.stage,
                label: d.label,
                metric: d.metric,
                planned: d.planned,
                actual: d.actual,
              },
              {
                type: 'actual',
                value: d.actual,
                color: POINT_COLORS.actual,
                stage: d.stage,
                label: d.label,
                metric: d.metric,
                planned: d.planned,
                actual: d.actual,
              },
            ])
            .join('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('y', (d) => subYScale(d.type)!)
            .attr('width', (d) => xScale(d.value))
            .attr('height', subYScale.bandwidth())
            .attr('fill', (d) => d.color)
            .attr('rx', useRoundedCorners ? cornerRadius : 0)
            .attr('ry', useRoundedCorners ? cornerRadius : 0);

          // Add value labels for planned bars
          stageGroups
            .selectAll('.planned-bar-label')
            .data((d) => [d])
            .join('text')
            .attr('class', 'planned-bar-label')
            .attr('x', (d) => xScale(d.planned) + 10)
            .attr('y', () => subYScale('planned')! + subYScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('font-family', 'Rubik')
            .attr('font-size', isPreview ? '10px' : '12px')
            .attr('font-weight', '400')
            .attr('fill', '#0F1214')
            .text((d) => `${d.planned.toFixed(1)} ${d.metric}`);

          // Add value labels for actual bars
          stageGroups
            .selectAll('.actual-bar-label')
            .data((d) => [d])
            .join('text')
            .attr('class', 'actual-bar-label')
            .attr('x', (d) => xScale(d.actual) + 10)
            .attr('y', () => subYScale('actual')! + subYScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('font-family', 'Rubik')
            .attr('font-size', isPreview ? '10px' : '12px')
            .attr('font-weight', '400')
            .attr('fill', '#0F1214')
            .text((d) => `${d.actual.toFixed(1)} ${d.metric}`);
          break;

        case 'spike':
        default:
          // Render default spike chart view with phase colors
          stageGroups
            .append('path')
            .attr('class', 'duration-area')
            .attr('d', (d) => {
              const y0 = subYScale('planned')! + subYScale.bandwidth() / 2;
              const y1 = subYScale('actual')! + subYScale.bandwidth() / 2;
              return `
                M 0 ${y0}
                L ${xScale(d.planned)} ${y0}
                L ${xScale(d.actual)} ${y1}
                L 0 ${y1}
                Z
              `;
            })
            .attr('fill', (d) => d.color)
            .attr('opacity', 0.7);

          // Add connecting lines
          stageGroups
            .append('line')
            .attr('class', 'connector')
            .attr('x1', (d) => xScale(d.planned))
            .attr('x2', (d) => xScale(d.actual))
            .attr('y1', () => subYScale('planned')! + subYScale.bandwidth() / 2)
            .attr('y2', () => subYScale('actual')! + subYScale.bandwidth() / 2)
            .attr('stroke', (d) => d.color)
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '4,4')
            .attr('opacity', 0.9);

          // Add planned points
          stageGroups
            .append('circle')
            .attr('class', 'planned-point')
            .attr('cx', (d) => xScale(d.planned))
            .attr('cy', () => subYScale('planned')! + subYScale.bandwidth() / 2)
            .attr('r', 6)
            .attr('fill', POINT_COLORS.planned)
            .attr('stroke', 'white')
            .attr('stroke-width', 2);

          // Add actual points
          stageGroups
            .append('circle')
            .attr('class', 'actual-point')
            .attr('cx', (d) => xScale(d.actual))
            .attr('cy', () => subYScale('actual')! + subYScale.bandwidth() / 2)
            .attr('r', 6)
            .attr('fill', POINT_COLORS.actual)
            .attr('stroke', 'white')
            .attr('stroke-width', 2);

          // Add value labels for planned points
          stageGroups
            .append('text')
            .attr('class', 'planned-label')
            .attr('x', (d) => xScale(d.planned) + 10)
            .attr('y', () => subYScale('planned')! + subYScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('font-family', 'Rubik')
            .attr('font-size', isPreview ? '10px' : '12px')
            .attr('font-weight', '400')
            .attr('fill', '#0F1214')
            .text((d) => `${d.planned.toFixed(1)} ${d.metric}`);

          // Add value labels for actual points
          stageGroups
            .append('text')
            .attr('class', 'actual-label')
            .attr('x', (d) => xScale(d.actual) + 10)
            .attr('y', () => subYScale('actual')! + subYScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('font-family', 'Rubik')
            .attr('font-size', isPreview ? '10px' : '12px')
            .attr('font-weight', '400')
            .attr('fill', '#0F1214')
            .text((d) => `${d.actual.toFixed(1)} ${d.metric}`);
          break;
      }

      // Define the tooltip event handler function
      const addTooltipEvents = (selection: d3.Selection<any, any, any, any>) => {
        // First remove any existing event listeners to prevent duplicates
        selection.on('mouseover', null).on('mousemove', null).on('mouseout', null);

        // Then add new event listeners
        selection
          .on('mouseover', function (event, d) {
            // Stop event propagation to prevent parent elements from triggering mouseout
            event.stopPropagation();

            // Calculate tooltip position with smart positioning
            const tooltipWidth = 250;
            const tooltipHeight = 150;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const spaceOnRight = windowWidth - event.pageX;
            const spaceOnBottom = windowHeight - event.pageY;

            // Determine if tooltip should appear on left or right
            const showOnLeft = spaceOnRight < tooltipWidth + 20;

            // Determine if tooltip should appear above or below
            const showAbove = spaceOnBottom < tooltipHeight + 20;

            // Calculate differences and percentages
            const diff = d.actual - d.planned;
            const percentDiff = ((diff / d.planned) * 100).toFixed(1);
            const variance = Math.abs(diff);

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
                `<div style="font-weight: 500; margin-bottom: 8px; font-size: 14px;">${d.label}</div>` +
                  `<div style="margin-top: 8px;">` +
                  `<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">` +
                  `<span style="color: #4d5c66;">Planned:</span>` +
                  `<span style="font-weight: 400;">${d.planned.toFixed(1)} ${d.metric.toLowerCase()}</span>` +
                  `</div>` +
                  `<div style="display: flex; justify-content: space-between;">` +
                  `<span style="color: #4d5c66;">Actual:</span>` +
                  `<span style="font-weight: 400;">${d.actual.toFixed(1)} ${d.metric.toLowerCase()}</span>` +
                  `</div>` +
                  `<div style="border-top: 1px solid #e5e7eb; margin: 8px 0;"></div>` +
                  `<div style="display: flex; justify-content: space-between;">` +
                  `<span style="color: #4d5c66;">Variance:</span>` +
                  `<span style="font-weight: 400; color: #149ef6">` +
                  `${diff >= 0 ? '+' : ''}${variance.toFixed(1)} ${d.metric.toLowerCase()} (${percentDiff}%)` +
                  `</span>` +
                  `</div>` +
                  `</div>`
              );
          })
          .on('mousemove', function (event) {
            // Stop event propagation
            event.stopPropagation();

            // Apply the same smart positioning during mouse movement
            const tooltipWidth = 250;
            const tooltipHeight = 150;
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
          .on('mouseout', function (event) {
            // Stop event propagation
            event.stopPropagation();

            // Use opacity instead of display none for smoother transitions
            tooltip.style('opacity', '0');
          });
      };

      // Apply tooltip events based on chart type
      if (chartType === 'bar' && barElements) {
        // For bar chart, add tooltip to bars
        addTooltipEvents(barElements);
      } else {
        // For spike chart, add tooltip to stage groups
        addTooltipEvents(stageGroups);
      }
    };

    updateChart();

    // Add resize listener with debounce
    let resizeTimeout: NodeJS.Timeout | null = null;
    const resizeObserver = new ResizeObserver(() => {
      // Clear previous timeout
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      // Set new timeout to debounce the resize event
      resizeTimeout = setTimeout(() => {
        // Don't remove the tooltip, just hide it temporarily during chart update
        d3.select('.bar-chart-tooltip').style('opacity', '0');
        updateChart();
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
        const tooltipElement = document.querySelector('.bar-chart-tooltip');
        if (tooltipElement && !document.contains(svgRef.current)) {
          tooltip.style('opacity', '0');
        }
      }, 50);
    };
  }, [data, isPreview, chartType, phaseColors, useRoundedCorners, cornerRadius, xAxisLabel]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative overflow-visible"
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'default',
      }}
    >
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};
