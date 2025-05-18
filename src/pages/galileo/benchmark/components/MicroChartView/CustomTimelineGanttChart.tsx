'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { NoDataMessage } from './NoDataMessage';

interface TimelineData {
  name: string;
  phase: string;
  color: string;
  metric: string;
  planned: {
    start: number;
    end: number;
    duration: number;
  };
  actual: {
    start: number;
    end: number;
    duration: number;
  };
}

interface TimelineGanttChartProps {
  data: TimelineData[] | null;
  isPreview?: boolean;
}

export const CustomTimelineGanttChart: React.FC<TimelineGanttChartProps> = ({
  data,
  isPreview = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  console.log('CustomTimelineGanttChart: Rendering with data', data);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data || data.length === 0) {
      return;
    }

    // console.log('CustomTimelineGanttChart: Rendering with data', data);

    // Create a stable tooltip reference
    // First, remove any orphaned tooltips that might exist from previous renders
    const existingTooltips = d3
      .select('body')
      .selectAll<HTMLDivElement, unknown>('.timeline-gantt-tooltip');
    if (existingTooltips.size() > 1) {
      // Keep only the first one and remove others to avoid duplicates
      existingTooltips
        .nodes()
        .slice(1)
        .forEach((node) => node.remove());
    }

    // Get or create the tooltip
    let tooltip = d3.select('body').select<HTMLDivElement>('.timeline-gantt-tooltip');
    if (tooltip.empty()) {
      // console.log('CustomTimelineGanttChart: Creating new tooltip');
      tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'timeline-gantt-tooltip')
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
    } else {
      // console.log('CustomTimelineGanttChart: Using existing tooltip');
    }

    // Define the updateChart function to handle initial rendering and updates
    const updateChart = () => {
      // Clear previous content
      d3.select(svgRef.current).selectAll('*').remove();

      // Get container dimensions
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      const margin = {
        top: isPreview ? 20 : 40,
        right: isPreview ? 50 : 100,
        bottom: isPreview ? 60 : 80,
        left: isPreview ? 120 : 180,
      };

      const width = Math.max(containerRect.width - margin.left - margin.right, 300);

      // For fullscreen mode, use a larger minimum height
      const minHeight = isPreview ? 300 : 500;
      const baseHeight = isPreview ? 350 : 600;
      const height = Math.max(baseHeight - margin.top - margin.bottom, minHeight);

      // Create SVG with responsive dimensions
      const svg = d3
        .select(svgRef.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${containerRect.width} ${baseHeight}`)
        .attr('preserveAspectRatio', isPreview ? 'xMinYMin meet' : 'xMidYMid meet');

      // Create main group
      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      // Find the earliest start time and latest end time across all data points
      let minStartTime = Infinity;
      let maxEndTime = -Infinity;

      data.forEach((item) => {
        // Find the earliest start time (either planned or actual)
        minStartTime = Math.min(minStartTime, item.planned.start, item.actual.start);

        // Find the latest end time (either planned or actual)
        maxEndTime = Math.max(maxEndTime, item.planned.end, item.actual.end);
      });

      // Add padding to the domain (5% on each side)
      const timeRange = maxEndTime - minStartTime;
      const padding = timeRange * 0.05;
      const paddedMinTime = new Date(minStartTime - padding);
      const paddedMaxTime = new Date(maxEndTime + padding);

      // Create a time-based scale for the x-axis
      const xScale = d3.scaleTime().domain([paddedMinTime, paddedMaxTime]).range([0, width]);

      // Create a band scale for the y-axis
      const yScale = d3
        .scaleBand()
        .domain(data.map((d) => d.name))
        .range([0, height])
        .padding(0.4);

      // Calculate the height of each phase row
      const rowHeight = yScale.bandwidth();
      const barHeight = rowHeight * 0.4; // 40% of the row height

      // Create clip path
      const clipId = `clip-${Math.random().toString(36).substring(2, 11)}`;
      svg
        .append('defs')
        .append('clipPath')
        .attr('id', clipId)
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height);

      // Add zoom rect FIRST (for x-axis zoom and panning)
      // This ensures it's at the bottom of the z-index stack
      const zoomRect = g
        .append('rect')
        .attr('class', 'zoom-rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'none')
        .style('pointer-events', 'all')
        .style('cursor', 'move');

      // Create a group for chart content with clip path
      const chartContent = g
        .append('g')
        .attr('class', 'chart-content')
        .attr('clip-path', `url(#${clipId})`);

      // Add vertical gridlines (subtle, only for major time divisions)
      chartContent
        .append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height})`)
        .call(
          d3
            .axisBottom(xScale)
            .ticks(d3.timeMonth.every(3)) // Every quarter for less visual clutter
            .tickSize(-height)
            .tickFormat(() => '')
        )
        .selectAll('line')
        .style('stroke', '#e5e7eb')
        .style('stroke-opacity', 0.3) // More subtle
        .style('shape-rendering', 'crispEdges');

      // Add phase rows
      const phaseRows = chartContent
        .selectAll('.phase-row')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'phase-row')
        .attr('transform', (d) => `translate(0,${yScale(d.name)!})`);

      // Add planned bars
      phaseRows
        .append('rect')
        .attr('class', 'planned-bar')
        .attr('x', (d) => xScale(new Date(d.planned.start)))
        .attr('y', (rowHeight - barHeight * 2) / 2) // Position at top half
        .attr('width', (d) =>
          Math.max(0, xScale(new Date(d.planned.end)) - xScale(new Date(d.planned.start)))
        )
        .attr('height', barHeight)
        .attr('fill', '#00aeef') // Use consistent color with other charts
        .attr('stroke', '#0099d6')
        .attr('stroke-width', 1)
        .attr('rx', 12) // Rounded corners matching other charts
        .attr('ry', 12)
        .attr('opacity', 1) // Start with full opacity (previously hover state)
        .on('mouseover', function (event, d) {
          // Stop event propagation
          event.stopPropagation();

          d3.select(this).attr('opacity', 0.7); // Use lower opacity on hover (previously default state)
          const mouseX = event.pageX;
          const mouseY = event.pageY;

          // Format dates in yyyy-mm-dd format
          const formatDate = (timestamp: number) => {
            const date = new Date(timestamp);
            return date.toISOString().split('T')[0]; // Returns yyyy-mm-dd
          };
          const plannedStartDate = formatDate(d.planned.start);
          const plannedEndDate = formatDate(d.planned.end);

          // Calculate precise duration in days
          const msPerDay = 1000 * 60 * 60 * 24;
          const plannedDurationDays = (d.planned.end - d.planned.start) / msPerDay;

          // Format duration as "X months, Y days" for better clarity
          const formatDuration = (daysValue: number, originalValue: number) => {
            // If the original duration is already in a specific unit (from the data), use that as primary
            if (originalValue !== undefined) {
              // Calculate the exact days
              const totalDays = daysValue;

              // Convert to months and days
              const months = Math.floor(totalDays / 30.436875); // Whole months
              const remainingDays = Math.round(totalDays % 30.436875); // Remaining days

              // Format the output
              if (months === 0) {
                // Less than a month, just show days
                return `${remainingDays} days`;
              } else if (remainingDays === 0) {
                // Exact months, no days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}`;
              } else {
                // Both months and days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}, ${remainingDays} days`;
              }
            } else {
              // No original value, calculate from days
              const totalDays = daysValue;

              // For very short durations, just show days
              if (totalDays < 7) {
                return `${Math.round(totalDays)} days`;
              }

              // Convert to months and days
              const months = Math.floor(totalDays / 30.436875); // Whole months
              const remainingDays = Math.round(totalDays % 30.436875); // Remaining days

              // Format the output
              if (months === 0) {
                // Less than a month, just show days
                return `${remainingDays} days`;
              } else if (remainingDays === 0) {
                // Exact months, no days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}`;
              } else {
                // Both months and days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}, ${remainingDays} days`;
              }
            }
          };

          tooltip
            .style('opacity', '1')
            .style('display', 'block')
            .style('left', `${mouseX + 20}px`)
            .style('top', `${mouseY - 20}px`)
            .html(
              `<div style="font-weight: 500; margin-bottom: 8px; font-size: 14px;">${d.name} - Planned</div>
             <div style="margin-top: 8px;">
               <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                 <span style="color: #4d5c66;">Start:</span>
                 <span style="font-weight: 400;">${plannedStartDate}</span>
               </div>
               <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                 <span style="color: #4d5c66;">End:</span>
                 <span style="font-weight: 400;">${plannedEndDate}</span>
               </div>
               <div style="display: flex; justify-content: space-between;">
                 <span style="color: #4d5c66;">Duration:</span>
                 <span style="font-weight: 400;">${formatDuration(plannedDurationDays, d.planned.duration)}</span>
               </div>
             </div>`
            );
        })
        .on('mousemove', function (event) {
          // Stop event propagation
          event.stopPropagation();

          const mouseX = event.pageX;
          const mouseY = event.pageY;

          tooltip.style('left', `${mouseX + 20}px`).style('top', `${mouseY - 20}px`);
        })
        .on('mouseout', function (event) {
          // Stop event propagation
          event.stopPropagation();

          d3.select(this).attr('opacity', 1); // Return to full opacity
          tooltip.style('opacity', '0');
        });

      // Add actual bars
      phaseRows
        .append('rect')
        .attr('class', 'actual-bar')
        .attr('x', (d) => xScale(new Date(d.actual.start)))
        .attr('y', rowHeight / 2 + (rowHeight - barHeight * 2) / 2) // Position at bottom half
        .attr('width', (d) =>
          Math.max(0, xScale(new Date(d.actual.end)) - xScale(new Date(d.actual.start)))
        )
        .attr('height', barHeight)
        .attr('fill', '#ff6b6b') // Use consistent color with other charts
        .attr('rx', 12) // Rounded corners matching other charts
        .attr('ry', 12)
        .attr('opacity', 1) // Start with full opacity (previously hover state)
        .on('mouseover', function (event, d) {
          // Stop event propagation
          event.stopPropagation();

          d3.select(this).attr('opacity', 0.9); // Use lower opacity on hover (previously default state)
          const mouseX = event.pageX;
          const mouseY = event.pageY;

          // Format dates in yyyy-mm-dd format
          const formatDate = (timestamp: number) => {
            const date = new Date(timestamp);
            return date.toISOString().split('T')[0]; // Returns yyyy-mm-dd
          };
          const actualStartDate = formatDate(d.actual.start);
          const actualEndDate = formatDate(d.actual.end);

          // Calculate variance with high precision
          // Calculate exact days difference
          const msPerDay = 1000 * 60 * 60 * 24;
          const startDaysDiff = (d.actual.start - d.planned.start) / msPerDay;
          const endDaysDiff = (d.actual.end - d.planned.end) / msPerDay;

          // Calculate actual duration in days
          const actualDurationDays = (d.actual.end - d.actual.start) / msPerDay;

          // Calculate months for display
          const startVariance = startDaysDiff / 30.436875; // Average days per month (365.24/12)
          const endVariance = endDaysDiff / 30.436875;

          // For duration, use the original values from the data
          const durationVariance = d.actual.duration - d.planned.duration;

          // Format duration as "X months, Y days" for better clarity (same as in planned tooltip)
          const formatDuration = (daysValue: number, originalValue: number) => {
            // If the original duration is already in a specific unit (from the data), use that as primary
            if (originalValue !== undefined) {
              // Calculate the exact days
              const totalDays = daysValue;

              // Convert to months and days
              const months = Math.floor(totalDays / 30.436875); // Whole months
              const remainingDays = Math.round(totalDays % 30.436875); // Remaining days

              // Format the output
              if (months === 0) {
                // Less than a month, just show days
                return `${remainingDays} days`;
              } else if (remainingDays === 0) {
                // Exact months, no days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}`;
              } else {
                // Both months and days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}, ${remainingDays} days`;
              }
            } else {
              // No original value, calculate from days
              const totalDays = daysValue;

              // For very short durations, just show days
              if (totalDays < 7) {
                return `${Math.round(totalDays)} days`;
              }

              // Convert to months and days
              const months = Math.floor(totalDays / 30.436875); // Whole months
              const remainingDays = Math.round(totalDays % 30.436875); // Remaining days

              // Format the output
              if (months === 0) {
                // Less than a month, just show days
                return `${remainingDays} days`;
              } else if (remainingDays === 0) {
                // Exact months, no days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}`;
              } else {
                // Both months and days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}, ${remainingDays} days`;
              }
            }
          };

          // Format variance with + or - sign and appropriate units
          const formatVariance = (value: number) => {
            const sign = value > 0 ? '+' : '';

            // Convert to days for calculation
            const days = value * 30.436875;

            // For very small differences (less than a few days), just show days
            if (Math.abs(days) < 7) {
              const daysSign = days > 0 ? '+' : '';
              return `${daysSign}${Math.round(days)} days`;
            }

            // Convert to months and days
            const absValue = Math.abs(value);
            const wholeMonths = Math.floor(absValue);
            const remainingDays = Math.round((absValue - wholeMonths) * 30.436875);

            // Format the output
            if (wholeMonths === 0) {
              // Less than a month, just show days
              return `${sign}${remainingDays} days`;
            } else if (remainingDays === 0) {
              // Exact months, no days
              return `${sign}${wholeMonths} ${wholeMonths === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}`;
            } else {
              // Both months and days
              return `${sign}${wholeMonths} ${wholeMonths === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}, ${remainingDays} days`;
            }
          };

          tooltip
            .style('opacity', '1')
            .style('display', 'block')
            .style('left', `${mouseX + 20}px`)
            .style('top', `${mouseY - 20}px`)
            .html(
              `<div style="font-weight: 500; margin-bottom: 8px; font-size: 14px;">${d.name} - Actual</div>
             <div style="margin-top: 8px;">
               <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                 <span style="color: #4d5c66;">Start:</span>
                 <span style="font-weight: 400;">${actualStartDate} <span style="color: ${startVariance > 0 ? '#ff6b6b' : '#4caf50'};">(${formatVariance(startVariance)})</span></span>
               </div>
               <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                 <span style="color: #4d5c66;">End:</span>
                 <span style="font-weight: 400;">${actualEndDate} <span style="color: ${endVariance > 0 ? '#ff6b6b' : '#4caf50'};">(${formatVariance(endVariance)})</span></span>
               </div>
               <div style="display: flex; justify-content: space-between;">
                 <span style="color: #4d5c66;">Duration:</span>
                 <span style="font-weight: 400;">${formatDuration(actualDurationDays, d.actual.duration)} <span style="color: ${durationVariance > 0 ? '#ff6b6b' : '#4caf50'};">(${formatVariance(durationVariance)})</span></span>
               </div>
               <div style="border-top: 1px solid #e5e7eb; margin: 8px 0;"></div>
               <div style="display: flex; justify-content: space-between;">
                 <span style="color: #4d5c66;">Variance:</span>
                 <span style="font-weight: 400; color: ${durationVariance > 0 ? '#ff6b6b' : '#4caf50'};">${formatVariance(durationVariance)}</span>
               </div>
             </div>`
            );
        })
        .on('mousemove', function (event) {
          // Stop event propagation
          event.stopPropagation();

          const mouseX = event.pageX;
          const mouseY = event.pageY;

          tooltip.style('left', `${mouseX + 20}px`).style('top', `${mouseY - 20}px`);
        })
        .on('mouseout', function (event) {
          // Stop event propagation
          event.stopPropagation();

          d3.select(this).attr('opacity', 1); // Return to full opacity
          tooltip.style('opacity', '0');
        });

      // Add connecting lines between planned and actual for start dates
      phaseRows
        .append('line')
        .attr('class', 'connector-start')
        .attr('x1', (d) => xScale(new Date(d.planned.start)))
        .attr('y1', (rowHeight - barHeight * 2) / 2 + barHeight / 2) // Middle of planned bar
        .attr('x2', (d) => xScale(new Date(d.actual.start)))
        .attr('y2', rowHeight / 2 + (rowHeight - barHeight * 2) / 2 + barHeight / 2) // Middle of actual bar
        .attr('stroke', (d) => {
          // Red if actual starts later, green if earlier
          return d.actual.start > d.planned.start ? '#ff6b6b' : '#4caf50';
        })
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4') // Dashed line matching other charts
        .attr('opacity', 0.7);

      // Add connecting lines between planned and actual for end dates
      phaseRows
        .append('line')
        .attr('class', 'connector-end')
        .attr('x1', (d) => xScale(new Date(d.planned.end)))
        .attr('y1', (rowHeight - barHeight * 2) / 2 + barHeight / 2) // Middle of planned bar
        .attr('x2', (d) => xScale(new Date(d.actual.end)))
        .attr('y2', rowHeight / 2 + (rowHeight - barHeight * 2) / 2 + barHeight / 2) // Middle of actual bar
        .attr('stroke', (d) => {
          // Red if actual ends later, green if earlier
          return d.actual.end > d.planned.end ? '#ff6b6b' : '#4caf50';
        })
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4') // Dashed line matching other charts
        .attr('opacity', 0.7);

      // Add labels for both planned and actual bars
      // Planned bar labels
      phaseRows
        .append('text')
        .attr('class', 'planned-bar-label')
        .attr('x', (d) => {
          // Position at the end of the planned bar
          return xScale(new Date(d.planned.end)) + 5;
        })
        .attr('y', (rowHeight - barHeight * 2) / 2 + barHeight / 2) // Middle of planned bar
        .attr('dy', '0.35em')
        .attr('text-anchor', 'start')
        .attr('fill', '#0F1214')
        .attr('font-family', 'var(--e-font-family-rubik)')
        .style('font-size', '10px')
        .attr('font-weight', '400')
        .text((d) => {
          // Calculate planned duration in days
          const msPerDay = 1000 * 60 * 60 * 24;
          const plannedDurationDays = (d.planned.end - d.planned.start) / msPerDay;

          // Format duration as "X months, Y days"
          const formatDuration = (daysValue: number, originalValue: number) => {
            // If the original duration is already in a specific unit (from the data), use that as primary
            if (originalValue !== undefined) {
              // Calculate the exact days
              const totalDays = daysValue;

              // Convert to months and days
              const months = Math.floor(totalDays / 30.436875); // Whole months
              const remainingDays = Math.round(totalDays % 30.436875); // Remaining days

              // Format the output
              if (months === 0) {
                // Less than a month, just show days
                return `${remainingDays} days`;
              } else if (remainingDays === 0) {
                // Exact months, no days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}`;
              } else {
                // Both months and days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}, ${remainingDays} days`;
              }
            } else {
              // No original value, calculate from days
              const totalDays = daysValue;

              // For very short durations, just show days
              if (totalDays < 7) {
                return `${Math.round(totalDays)} days`;
              }

              // Convert to months and days
              const months = Math.floor(totalDays / 30.436875); // Whole months
              const remainingDays = Math.round(totalDays % 30.436875); // Remaining days

              // Format the output
              if (months === 0) {
                // Less than a month, just show days
                return `${remainingDays} days`;
              } else if (remainingDays === 0) {
                // Exact months, no days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}`;
              } else {
                // Both months and days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}, ${remainingDays} days`;
              }
            }
          };

          return formatDuration(plannedDurationDays, d.planned.duration);
        })
        .style('pointer-events', 'none'); // Prevent interfering with bar interactions

      // Actual bar labels
      phaseRows
        .append('text')
        .attr('class', 'actual-bar-label')
        .attr('x', (d) => {
          // Position at the end of the actual bar
          return xScale(new Date(d.actual.end)) + 5;
        })
        .attr('y', rowHeight / 2 + (rowHeight - barHeight * 2) / 2 + barHeight / 2) // Middle of actual bar
        .attr('dy', '0.35em')
        .attr('text-anchor', 'start')
        .attr('fill', '#0F1214') // Black text for better readability
        .attr('font-family', 'var(--e-font-family-rubik)')
        .style('font-size', '10px')
        .attr('font-weight', '400')
        .text((d) => {
          // Calculate actual duration in days
          const msPerDay = 1000 * 60 * 60 * 24;
          const actualDurationDays = (d.actual.end - d.actual.start) / msPerDay;

          // Format duration as "X months, Y days"
          const formatDuration = (daysValue: number, originalValue: number) => {
            // If the original duration is already in a specific unit (from the data), use that as primary
            if (originalValue !== undefined) {
              // Calculate the exact days
              const totalDays = daysValue;

              // Convert to months and days
              const months = Math.floor(totalDays / 30.436875); // Whole months
              const remainingDays = Math.round(totalDays % 30.436875); // Remaining days

              // Format the output
              if (months === 0) {
                // Less than a month, just show days
                return `${remainingDays} days`;
              } else if (remainingDays === 0) {
                // Exact months, no days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}`;
              } else {
                // Both months and days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}, ${remainingDays} days`;
              }
            } else {
              // No original value, calculate from days
              const totalDays = daysValue;

              // For very short durations, just show days
              if (totalDays < 7) {
                return `${Math.round(totalDays)} days`;
              }

              // Convert to months and days
              const months = Math.floor(totalDays / 30.436875); // Whole months
              const remainingDays = Math.round(totalDays % 30.436875); // Remaining days

              // Format the output
              if (months === 0) {
                // Less than a month, just show days
                return `${remainingDays} days`;
              } else if (remainingDays === 0) {
                // Exact months, no days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}`;
              } else {
                // Both months and days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}, ${remainingDays} days`;
              }
            }
          };

          return formatDuration(actualDurationDays, d.actual.duration);
        })
        .style('pointer-events', 'none'); // Prevent interfering with bar interactions

      // Add phase duration labels at the end (only in non-preview mode)
      if (!isPreview) {
        phaseRows
          .append('text')
          .attr('class', 'phase-label')
          .attr('x', (d) => {
            // Position label at the end of the longer bar (planned or actual)
            // with extra space to avoid overlapping with bar labels
            const plannedEnd = xScale(new Date(d.planned.end));
            const actualEnd = xScale(new Date(d.actual.end));
            return Math.max(plannedEnd, actualEnd) + 120; // Increased spacing
          })
          .attr('y', rowHeight / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'start')
          .attr('fill', '#0F1214')
          .attr('font-family', 'var(--e-font-family-rubik)')
          .style('font-size', '12px')
          .attr('font-weight', '400')
          .text((d) => {
            const variance = d.actual.duration - d.planned.duration;

            // Calculate actual duration in days
            const msPerDay = 1000 * 60 * 60 * 24;
            const actualDurationDays = (d.actual.end - d.actual.start) / msPerDay;

            // Format duration as "X months, Y days" for better clarity
            const formatDuration = (daysValue: number, _originalValue?: number) => {
              // Calculate the exact days
              const totalDays = daysValue;

              // Convert to months and days
              const months = Math.floor(totalDays / 30.436875); // Whole months
              const remainingDays = Math.round(totalDays % 30.436875); // Remaining days

              // Format the output
              if (months === 0) {
                // Less than a month, just show days
                return `${remainingDays} days`;
              } else if (remainingDays === 0) {
                // Exact months, no days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}`;
              } else {
                // Both months and days
                return `${months} ${months === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}, ${remainingDays} days`;
              }
            };

            // Format variance with + or - sign and appropriate units
            const formatVariance = (value: number) => {
              const sign = value > 0 ? '+' : '';

              // Convert to days for calculation
              const days = value * 30.436875;

              // For very small differences (less than a few days), just show days
              if (Math.abs(days) < 7) {
                const daysSign = days > 0 ? '+' : '';
                return `${daysSign}${Math.round(days)} days`;
              }

              // Convert to months and days
              const absValue = Math.abs(value);
              const wholeMonths = Math.floor(absValue);
              const remainingDays = Math.round((absValue - wholeMonths) * 30.436875);

              // Format the output
              if (wholeMonths === 0) {
                // Less than a month, just show days
                return `${sign}${remainingDays} days`;
              } else if (remainingDays === 0) {
                // Exact months, no days
                return `${sign}${wholeMonths} ${wholeMonths === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}`;
              } else {
                // Both months and days
                return `${sign}${wholeMonths} ${wholeMonths === 1 ? d.metric.toLowerCase().slice(0, -1) : d.metric.toLowerCase()}, ${remainingDays} days`;
              }
            };

            return `${formatDuration(actualDurationDays, d.actual.duration)} (${formatVariance(variance)})`;
          });
      }

      // Add legend for planned vs actual
      const legendGroup = g
        .append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 220}, -30)`);

      // Planned bar legend
      legendGroup
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 16)
        .attr('height', 8)
        .attr('fill', '#00aeef')
        .attr('stroke', '#0099d6')
        .attr('stroke-width', 1)
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('opacity', 1); // Match the new default opacity

      legendGroup
        .append('text')
        .attr('x', 24)
        .attr('y', 8)
        .attr('text-anchor', 'start')
        .attr('fill', '#0F1214')
        .attr('font-family', 'var(--e-font-family-rubik)')
        .style('font-size', '12px') // Always use 12px
        .attr('font-weight', '400')
        .text('Planned');

      // Actual bar legend
      legendGroup
        .append('rect')
        .attr('x', 100)
        .attr('y', 0)
        .attr('width', 16)
        .attr('height', 8)
        .attr('fill', '#ff6b6b')
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('opacity', 1); // Match the new default opacity

      legendGroup
        .append('text')
        .attr('x', 124)
        .attr('y', 8)
        .attr('text-anchor', 'start')
        .attr('fill', '#0F1214')
        .attr('font-family', 'var(--e-font-family-rubik)')
        .style('font-size', '12px') // Always use 12px
        .attr('font-weight', '400')
        .text('Actual');

      // Add axes
      // Create a filter for the shadow effect for x-axis label
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

      // X-axis (time)
      const xAxis = g
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(
          d3
            .axisBottom(xScale)
            .ticks(isPreview ? 5 : 10)
            .tickFormat((d) => {
              const date = d as Date;
              return date.toISOString().split('T')[0]; // yyyy-mm-dd format
            })
        );

      // Style x-axis
      xAxis
        .selectAll('.tick text')
        .style('font-family', 'var(--e-font-family-rubik)')
        .style('font-size', '12px') // Always use 12px
        .style('fill', '#77868F')
        .attr('transform', 'rotate(-60)')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em');

      xAxis.select('.domain').style('stroke', '#ccc');
      xAxis.selectAll('.tick line').style('stroke', '#ccc');

      // Add y-axis (phases)
      const yAxis = g.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScale));

      // Style y-axis
      g.selectAll('.y-axis .tick text')
        .style('font-family', 'var(--e-font-family-rubik)')
        .style('font-size', '12px') // Always use 12px
        .style('font-weight', '400')
        .style('fill', '#0F1214')
        .attr('x', -8);

      yAxis.select('.domain').style('stroke', '#ccc');
      yAxis.selectAll('.tick line').style('stroke', '#ccc');

      // Create a temporary text element to measure the actual width of the x-axis label
      const xAxisLabel = 'Project Timeline';
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
      const labelPadding = isPreview ? 10 : 16;

      // Add background rectangle for the x-axis label
      g.append('rect')
        .attr('class', 'x-axis-label-bg')
        .attr('x', width / 2 - textWidth / 2 - labelPadding / 2)
        .attr('y', height + (isPreview ? 10 : 10))
        .attr('width', textWidth + labelPadding)
        .attr('height', isPreview ? 20 : 24)
        .attr('fill', 'white')
        .attr('stroke', '#f5f5f5')
        .attr('stroke-width', 1)
        .attr('rx', 4)
        .attr('ry', 4)
        .style('filter', `url(#${filterId})`)
        .style('pointer-events', 'none'); // Ensure it doesn't interfere with interactions

      // Add x-axis label (add to g instead of xAxis to ensure proper positioning)
      g.append('text')
        .attr('class', 'x-axis-label')
        .attr('x', width / 2)
        .attr('y', height + (isPreview ? 23 : 25))
        .attr('fill', '#77868F')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle') // Ensure vertical centering
        .style('font-size', isPreview ? '12px' : '14px')
        .style('font-family', 'var(--e-font-family-rubik)')
        .style('font-weight', '400')
        .style('pointer-events', 'none') // Ensure it doesn't interfere with interactions
        .style('z-index', '999') // Try to ensure it's on top
        .text(xAxisLabel);

      // Zoom rect was already created at the beginning (before the chart content)

      // Add zoom behavior
      const zoom = d3
        .zoom()
        .scaleExtent([0.2, 8]) // Match scatterplot zoom range
        .extent([
          [0, 0],
          [width, height],
        ])
        .on('zoom', (event) => {
          // Get the new scale
          const newXScale = event.transform.rescaleX(xScale);

          // Update x-axis with smooth transition
          xAxis
            .transition()
            .duration(100)
            .ease(d3.easeLinear)
            .call(
              d3
                .axisBottom(newXScale)
                .ticks(isPreview ? 5 : 10)
                .tickFormat((d) => {
                  const date = d as Date;
                  return date.toISOString().split('T')[0]; // yyyy-mm-dd format
                })
            );

          // Style x-axis after update
          g.selectAll('.x-axis .tick text')
            .style('font-family', 'var(--e-font-family-rubik)')
            .style('font-size', '12px') // Always use 12px
            .style('fill', '#77868F')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em');

          // Make sure the x-axis label and background stay visible and properly positioned
          g.select('.x-axis-label-bg').attr('y', height + (isPreview ? 10 : 10));

          g.select('.x-axis-label').attr('y', height + (isPreview ? 23 : 25));

          // Update all elements in the chart content
          // Update planned bars
          phaseRows
            .selectAll<SVGRectElement, TimelineData>('.planned-bar')
            .attr('x', (d: TimelineData) => newXScale(new Date(d.planned.start)))
            .attr('width', (d: TimelineData) =>
              Math.max(0, newXScale(new Date(d.planned.end)) - newXScale(new Date(d.planned.start)))
            );

          // Update actual bars
          phaseRows
            .selectAll<SVGRectElement, TimelineData>('.actual-bar')
            .attr('x', (d: TimelineData) => newXScale(new Date(d.actual.start)))
            .attr('width', (d: TimelineData) =>
              Math.max(0, newXScale(new Date(d.actual.end)) - newXScale(new Date(d.actual.start)))
            );

          // Update connecting lines for start dates
          phaseRows
            .selectAll<SVGLineElement, TimelineData>('.connector-start')
            .attr('x1', (d: TimelineData) => newXScale(new Date(d.planned.start)))
            .attr('x2', (d: TimelineData) => newXScale(new Date(d.actual.start)));

          // Update connecting lines for end dates
          phaseRows
            .selectAll<SVGLineElement, TimelineData>('.connector-end')
            .attr('x1', (d: TimelineData) => newXScale(new Date(d.planned.end)))
            .attr('x2', (d: TimelineData) => newXScale(new Date(d.actual.end)));

          // Update planned bar labels
          phaseRows
            .selectAll<SVGTextElement, TimelineData>('.planned-bar-label')
            .attr('x', (d: TimelineData) => {
              // Position at the end of the planned bar
              return newXScale(new Date(d.planned.end)) + 5;
            });

          // Update actual bar labels
          phaseRows
            .selectAll<SVGTextElement, TimelineData>('.actual-bar-label')
            .attr('x', (d: TimelineData) => {
              // Position at the end of the actual bar
              return newXScale(new Date(d.actual.end)) + 5;
            });

          // Update phase labels if they exist
          if (!isPreview) {
            phaseRows
              .selectAll<SVGTextElement, TimelineData>('.phase-label')
              .attr('x', (d: TimelineData) => {
                // Position label at the end of the longer bar (planned or actual)
                // with extra space to avoid overlapping with bar labels
                const plannedEnd = newXScale(new Date(d.planned.end));
                const actualEnd = newXScale(new Date(d.actual.end));
                return Math.max(plannedEnd, actualEnd) + 120; // Increased spacing
              });
          }

          // Update grid lines
          chartContent
            .selectAll('.grid line')
            .transition()
            .duration(100)
            .ease(d3.easeLinear)
            .attr('x1', (d: any) => newXScale(d))
            .attr('x2', (d: any) => newXScale(d));
        });

      // Apply zoom behavior to the zoom rect
      zoomRect.call(zoom as any);

      // Make sure all interactive elements have pointer-events set properly
      chartContent
        .selectAll('.planned-bar, .actual-bar')
        .style('pointer-events', 'all')
        .style('cursor', 'pointer');

      // Double-click to reset zoom
      zoomRect.on('dblclick', () => {
        zoomRect
          .transition()
          .duration(400)
          .ease(d3.easeCubicInOut)
          .call(zoom.transform as any, d3.zoomIdentity);
      });

      // Add zoom helper text if not in preview mode (more subtle)
      if (!isPreview) {
        svg
          .append('text')
          .attr('x', containerRect.width - margin.right - 10)
          .attr('y', margin.top - 15)
          .attr('text-anchor', 'end')
          .style('font-size', '11px')
          .style('font-family', 'var(--e-font-family-rubik)')
          .style('fill', '#77868F')
          .style('opacity', 0.7)
          .text('Drag to pan, use mouse wheel to zoom');
      }

      // Initial zoom to fit content
      const initialTransform = d3.zoomIdentity;
      svg.call(zoom.transform as any, initialTransform);
    };

    // Call updateChart to render the initial chart
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
          d3.select('.timeline-gantt-tooltip').style('opacity', '0');
          // Re-render the chart
          d3.select(svgRef.current).selectAll('*').remove();
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
        const tooltipElement = document.querySelector('.timeline-gantt-tooltip');
        if (tooltipElement && !document.contains(svgRef.current)) {
          tooltip.style('opacity', '0');
        }
      }, 50);
    };
  }, [data, isPreview]);

  if (!data || data.length === 0) {
    return (
      <div
        ref={containerRef}
        className="timeline-gantt-chart-container"
        style={{ width: '100%', height: '100%' }}
      >
        <NoDataMessage isPreview={isPreview} message="No timeline data available" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="timeline-gantt-chart-container"
      style={{ width: '100%', height: '100%' }}
    >
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
