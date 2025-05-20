'use client';

import * as d3 from 'd3';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { abacusApiClient } from '@/lib/config/axiosConfig';
import './CombinedGanttChart.scss';

// Define the data structure based on the API response
interface GanttChartData {
  _id: string;
  project_code: string;
  type: string;
  category_level: number;
  level_1_name: string;
  gantt_chart_legend: string;
  planned_start_date: string;
  planned_finish_date: string;
  actual_start_date: string;
  actual_finish_date: string;
  planned_duration: number;
  actual_duration: number;
}

interface CombinedGanttChartProps {
  projectCode: string;
  projectType: string;
  level1Name: string;
  isPreview?: boolean;
  onDataLoaded?: (data: GanttChartData[] | null, loading: boolean, error: string | null) => void;
}

export const CombinedGanttChart: React.FC<CombinedGanttChartProps> = ({
  projectCode,
  projectType,
  level1Name,
  isPreview = false,
  onDataLoaded,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onDataLoadedRef = useRef(onDataLoaded);
  const [data, setData] = useState<GanttChartData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Update the ref when the callback changes
  useEffect(() => {
    onDataLoadedRef.current = onDataLoaded;
  }, [onDataLoaded]);

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Notify parent component about loading state
      if (onDataLoadedRef.current) {
        onDataLoadedRef.current(null, true, null);
      }
      try {
        const response = await abacusApiClient.post('/duration/gantt', {
          type: projectType,
          project_code: projectCode,
          level_1_name: level1Name,
        });
        const responseData = response.data.data;
        setData(responseData);
        setError(null);
        // Notify parent component about data loading state
        if (onDataLoadedRef.current) {
          onDataLoadedRef.current(responseData, false, null);
        }
      } catch (err) {
        console.error('Error fetching Gantt chart data:', err);
        const errorMessage = 'Failed to load chart data. Please try again.';
        setError(errorMessage);
        setData(null);
        // Notify parent component about error state
        if (onDataLoadedRef.current) {
          onDataLoadedRef.current(null, false, errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectCode, projectType, level1Name]);

  // Use useLayoutEffect for synchronous DOM measurements and manipulations
  useLayoutEffect(() => {
    if (!svgRef.current || !containerRef.current || !data || data.length === 0) {
      return;
    }

    // Create a stable tooltip reference
    // First, remove any orphaned tooltips that might exist from previous renders
    const existingTooltips = d3
      .select('body')
      .selectAll<HTMLDivElement, unknown>('.combined-gantt-chart-tooltip');
    if (existingTooltips.size() > 1) {
      // Keep only the first one and remove others to avoid duplicates
      existingTooltips
        .nodes()
        .slice(1)
        .forEach((node) => node.remove());
    }

    // Get or create the tooltip
    let tooltip = d3.select('body').select<HTMLDivElement>('.combined-gantt-chart-tooltip');
    if (tooltip.empty()) {
      tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'combined-gantt-chart-tooltip')
        .style('position', 'absolute')
        .style('z-index', '999999')
        .style('background-color', 'white')
        .style('border', '1px solid #ddd')
        .style('padding', isPreview ? '12px' : '16px')
        .style('border-radius', '24px')
        .style('font-size', isPreview ? '11px' : '14px')
        .style('pointer-events', 'none')
        .style('min-width', isPreview ? '200px' : '250px')
        .style('max-width', isPreview ? '250px' : '300px')
        .style('z-index', '999999')
        .style('box-shadow', '0 4px 6px rgba(0,0,0,0.1)')
        .style('font-family', 'var(--e-font-family-rubik)')
        .style('opacity', '0')
        .style('transition', 'opacity 0.15s');
    }

    // Helper function to apply consistent styling to axis labels
    const applyAxisStyles = (selection: d3.Selection<any, any, any, any>, isXAxis = true) => {
      selection
        .selectAll<SVGTextElement, unknown>('.tick text')
        .style('font-family', 'var(--e-font-family-rubik)')
        .style('font-size', isPreview ? '12px' : '14px')
        .style('fill', isXAxis ? '#77868F' : '#0F1214');

      selection.selectAll('.tick line').style('stroke', '#ccc');
      selection.select('.domain').style('stroke', '#ccc');
    };

    // Define a render function that we can reuse for initial render and resizing
    const renderChart = () => {
      // Clear previous content
      d3.select(svgRef.current).selectAll('*').remove();

      // Get container dimensions
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      const margin = {
        top: isPreview ? 30 : 40,
        right: isPreview ? 50 : 80,
        bottom: isPreview ? 60 : 80,
        left: isPreview ? 140 : 200, // Increased left margin to accommodate multiline labels
      };

      const width = Math.max(containerRect.width - margin.left - margin.right, 300);
      const baseHeight = isPreview ? 350 : containerRect.height || 600;
      const height = baseHeight - margin.top - margin.bottom;

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

      // Create scales
      // Find the earliest start time and latest end time across all data points
      let minStartTime = Infinity;
      let maxEndTime = -Infinity;

      // Helper function to check if a data point has all required fields
      const hasAllRequiredFields = (d: GanttChartData): boolean => {
        return !!(
          d.planned_start_date &&
          d.planned_finish_date &&
          d.actual_start_date &&
          d.actual_finish_date &&
          d.planned_duration !== undefined &&
          d.actual_duration !== undefined
        );
      };

      // Filter data to only include items with all required fields
      const validData = data.filter(hasAllRequiredFields);

      // Check if we have any valid data
      if (validData.length === 0) {
        // Render a message in the chart area if no valid data
        g.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .style('font-family', 'var(--e-font-family-rubik)')
          .style('font-size', '16px')
          .style('fill', '#6b7280')
          .text('No complete data available for this chart');
        return; // Exit the render function
      }

      validData.forEach((item) => {
        // Find the earliest start time (either planned or actual)
        const plannedStart = new Date(item.planned_start_date).getTime();
        const actualStart = new Date(item.actual_start_date).getTime();
        minStartTime = Math.min(minStartTime, plannedStart, actualStart);

        // Find the latest end time (either planned or actual)
        const plannedEnd = new Date(item.planned_finish_date).getTime();
        const actualEnd = new Date(item.actual_finish_date).getTime();
        maxEndTime = Math.max(maxEndTime, plannedEnd, actualEnd);
      });

      // If we couldn't find valid times, use fallbacks
      if (minStartTime === Infinity || maxEndTime === -Infinity) {
        minStartTime = new Date().getTime() - 30 * 24 * 60 * 60 * 1000; // 30 days ago
        maxEndTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // 30 days in future
      }

      // Add padding to the time range (5% on each side)
      const timeRange = maxEndTime - minStartTime;
      const paddedMinTime = minStartTime - timeRange * 0.05;
      const paddedMaxTime = maxEndTime + timeRange * 0.05;

      // Create a time-based scale for the x-axis
      const xScale = d3.scaleTime()
        .domain([new Date(paddedMinTime), new Date(paddedMaxTime)])
        .range([0, width])
        .nice();

      // Get unique legend values from valid data
      const uniqueLegends = Array.from(new Set(validData.map(d => d.gantt_chart_legend)));

      // Create an expanded domain for y-axis that includes both planned and actual for each legend
      const expandedDomain: string[] = [];
      uniqueLegends.forEach(legend => {
        expandedDomain.push(`${legend} (Planned)`);
        expandedDomain.push(`${legend} (Actual)`);
      });

      // Create a band scale for the y-axis with the expanded domain
      const yScale = d3.scaleBand()
        .domain(expandedDomain)
        .range([0, height])
        .padding(0.15);

      // Function to format y-axis labels with line breaks
      const formatYAxisLabel = (text: string) => {
        // Split the label into legend name and type (Planned/Actual)
        const match = text.match(/(.+) \((Planned|Actual)\)$/);
        if (match) {
          const [_, legendName, type] = match;
          return `${legendName}\n(${type})`;
        }
        return text;
      };

      // Add clip path to constrain rendering within plot area
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

      // Create a group for chart content with clip path
      const chartContent = g
        .append('g')
        .attr('class', 'chart-content')
        .attr('clip-path', `url(#${clipId})`);

      // Add grid lines (X grid)
      g.append('g')
        .attr('class', 'grid')
        .selectAll('line')
        .data(xScale.ticks(8))
        .enter()
        .append('line')
        .attr('class', 'x-grid')
        .attr('x1', (d) => xScale(d))
        .attr('x2', (d) => xScale(d))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#e5e7eb')
        .attr('stroke-dasharray', '5,5');

      // Add horizontal grid lines between each category
      expandedDomain.forEach((_, i) => {
        if (i > 0) {
          const yPos = (yScale(expandedDomain[i-1])! + yScale.bandwidth()) +
                      (yScale(expandedDomain[i])! - (yScale(expandedDomain[i-1])! + yScale.bandwidth())) / 2;

          g.append('line')
            .attr('class', 'y-grid')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', yPos)
            .attr('y2', yPos)
            .attr('stroke', '#e5e7eb')
            .attr('stroke-dasharray', i % 2 === 0 ? '5,5' : '2,2')
            .attr('stroke-width', i % 2 === 0 ? 1 : 0.5);
        }
      });

      // Color scale for different phases
      const colorScale = d3.scaleOrdinal<string>()
        .domain(uniqueLegends)
        .range([
          '#4e79a7', '#f28e2c', '#e15759', '#76b7b2',
          '#59a14f', '#edc949', '#af7aa1', '#ff9da7',
          '#9c755f', '#bab0ab'
        ]);

      // Create a separate layer for interactive elements that will capture mouse events
      // but still allow zoom/pan to work
      const interactionLayer = chartContent
        .append('g')
        .attr('class', 'interaction-layer');

      // Add planned bars
      chartContent
        .selectAll('.planned-bar')
        .data(validData)
        .enter()
        .append('rect')
        .attr('class', 'planned-bar')
        .attr('x', d => xScale(new Date(d.planned_start_date)))
        .attr('y', d => yScale(`${d.gantt_chart_legend} (Planned)`)!)
        .attr('width', d => {
          const start = xScale(new Date(d.planned_start_date));
          const end = xScale(new Date(d.planned_finish_date));
          return Math.max(0, end - start);
        })
        .attr('height', yScale.bandwidth())
        .attr('fill', d => colorScale(d.gantt_chart_legend))
        .attr('opacity', 0.7)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('stroke', d => d3.color(colorScale(d.gantt_chart_legend))!.darker(0.5).toString())
        .attr('stroke-width', 1);

      // Add invisible interactive rectangles for planned bars
      interactionLayer
        .selectAll('.planned-bar-interaction')
        .data(validData)
        .enter()
        .append('rect')
        .attr('class', 'planned-bar-interaction')
        .attr('x', d => xScale(new Date(d.planned_start_date)))
        .attr('y', d => yScale(`${d.gantt_chart_legend} (Planned)`)!)
        .attr('width', d => {
          const start = xScale(new Date(d.planned_start_date));
          const end = xScale(new Date(d.planned_finish_date));
          return Math.max(0, end - start);
        })
        .attr('height', yScale.bandwidth())
        .attr('fill', 'transparent')
        .style('pointer-events', 'all')
        .style('cursor', 'pointer')
        .on('mouseover', function (event, d) {
          // Stop event propagation
          event.stopPropagation();

          // Highlight the bar
          d3.select(this).attr('opacity', 0.9);

          // Show tooltip with smart positioning
          const mouseX = event.pageX;
          const mouseY = event.pageY;

          // Calculate smart position for tooltip
          const tooltipWidth = 250;
          const tooltipHeight = 180;
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          // Check available space
          const spaceOnRight = windowWidth - mouseX;
          const spaceOnBottom = windowHeight - mouseY;

          // Position tooltip to ensure it stays in viewport
          const showOnLeft = spaceOnRight < tooltipWidth + 20;
          const showAbove = spaceOnBottom < tooltipHeight + 20;

          tooltip
            .style('opacity', '1')
            .style('left', showOnLeft ? `${mouseX - tooltipWidth - 10}px` : `${mouseX + 10}px`)
            .style('top', showAbove ? `${mouseY - tooltipHeight - 10}px` : `${mouseY + 10}px`)
            .html(
              `<div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">${d.gantt_chart_legend} (Planned)</div>
               <div style="display: flex; flex-direction: column; gap: 8px;">
                 <div style="display: flex; justify-content: space-between;">
                   <span style="color: #4b5563;">Project:</span>
                   <span style="font-weight: 500;">${d.project_code}</span>
                 </div>
                 <div style="display: flex; justify-content: space-between;">
                   <span style="color: #4b5563;">Start Date:</span>
                   <span style="font-weight: 500;">${new Date(d.planned_start_date).toLocaleDateString()}</span>
                 </div>
                 <div style="display: flex; justify-content: space-between;">
                   <span style="color: #4b5563;">End Date:</span>
                   <span style="font-weight: 500;">${new Date(d.planned_finish_date).toLocaleDateString()}</span>
                 </div>
                 <div style="display: flex; justify-content: space-between;">
                   <span style="color: #4b5563;">Duration:</span>
                   <span style="font-weight: 500;">${d.planned_duration} days</span>
                 </div>
               </div>`
            );
        })
        .on('mousemove', function (event) {
          // Smart positioning for the tooltip during mouse movement
          const mouseX = event.pageX;
          const mouseY = event.pageY;

          // Calculate smart position for tooltip
          const tooltipWidth = 250;
          const tooltipHeight = 180;
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          // Check available space
          const spaceOnRight = windowWidth - mouseX;
          const spaceOnBottom = windowHeight - mouseY;

          // Position tooltip to ensure it stays in viewport
          const showOnLeft = spaceOnRight < tooltipWidth + 20;
          const showAbove = spaceOnBottom < tooltipHeight + 20;

          tooltip
            .style('left', showOnLeft ? `${mouseX - tooltipWidth - 10}px` : `${mouseX + 10}px`)
            .style('top', showAbove ? `${mouseY - tooltipHeight - 10}px` : `${mouseY + 10}px`);
        })
        .on('mouseout', function () {
          // Reset bar appearance
          d3.select(this).attr('opacity', 0.7);
          // Hide tooltip
          tooltip.style('opacity', '0');
        });

      // Add actual bars
      chartContent
        .selectAll('.actual-bar')
        .data(validData)
        .enter()
        .append('rect')
        .attr('class', 'actual-bar')
        .attr('x', d => xScale(new Date(d.actual_start_date)))
        .attr('y', d => yScale(`${d.gantt_chart_legend} (Actual)`)!)
        .attr('width', d => {
          const start = xScale(new Date(d.actual_start_date));
          const end = xScale(new Date(d.actual_finish_date));
          return Math.max(0, end - start);
        })
        .attr('height', yScale.bandwidth())
        .attr('fill', d => {
          const baseColor = d3.color(colorScale(d.gantt_chart_legend))!;
          return baseColor.darker(0.3).toString();
        })
        .attr('opacity', 0.8)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('stroke', d => d3.color(colorScale(d.gantt_chart_legend))!.darker(0.8).toString())
        .attr('stroke-width', 1);

      // Add invisible interactive rectangles for actual bars
      interactionLayer
        .selectAll('.actual-bar-interaction')
        .data(validData)
        .enter()
        .append('rect')
        .attr('class', 'actual-bar-interaction')
        .attr('x', d => xScale(new Date(d.actual_start_date)))
        .attr('y', d => yScale(`${d.gantt_chart_legend} (Actual)`)!)
        .attr('width', d => {
          const start = xScale(new Date(d.actual_start_date));
          const end = xScale(new Date(d.actual_finish_date));
          return Math.max(0, end - start);
        })
        .attr('height', yScale.bandwidth())
        .attr('fill', 'transparent')
        .style('pointer-events', 'all')
        .style('cursor', 'pointer')
        .on('mouseover', function (event, d) {
          // Stop event propagation
          event.stopPropagation();

          // Highlight the bar
          d3.select(this).attr('opacity', 1);

          // Show tooltip with smart positioning
          const mouseX = event.pageX;
          const mouseY = event.pageY;

          // Calculate variance
          const plannedDays = d.planned_duration;
          const actualDays = d.actual_duration;
          const variance = actualDays - plannedDays;
          const percentVariance = ((variance / plannedDays) * 100).toFixed(1);

          // Calculate smart position for tooltip
          const tooltipWidth = 250;
          const tooltipHeight = 200;
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          // Check available space
          const spaceOnRight = windowWidth - mouseX;
          const spaceOnBottom = windowHeight - mouseY;

          // Position tooltip to ensure it stays in viewport
          const showOnLeft = spaceOnRight < tooltipWidth + 20;
          const showAbove = spaceOnBottom < tooltipHeight + 20;

          tooltip
            .style('opacity', '1')
            .style('left', showOnLeft ? `${mouseX - tooltipWidth - 10}px` : `${mouseX + 10}px`)
            .style('top', showAbove ? `${mouseY - tooltipHeight - 10}px` : `${mouseY + 10}px`)
            .html(
              `<div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">${d.gantt_chart_legend} (Actual)</div>
               <div style="display: flex; flex-direction: column; gap: 8px;">
                 <div style="display: flex; justify-content: space-between;">
                   <span style="color: #4b5563;">Project:</span>
                   <span style="font-weight: 500;">${d.project_code}</span>
                 </div>
                 <div style="display: flex; justify-content: space-between;">
                   <span style="color: #4b5563;">Start Date:</span>
                   <span style="font-weight: 500;">${new Date(d.actual_start_date).toLocaleDateString()}</span>
                 </div>
                 <div style="display: flex; justify-content: space-between;">
                   <span style="color: #4b5563;">End Date:</span>
                   <span style="font-weight: 500;">${new Date(d.actual_finish_date).toLocaleDateString()}</span>
                 </div>
                 <div style="display: flex; justify-content: space-between;">
                   <span style="color: #4b5563;">Duration:</span>
                   <span style="font-weight: 500;">${d.actual_duration} days</span>
                 </div>
                 <div style="display: flex; justify-content: space-between;">
                   <span style="color: #4b5563;">Variance:</span>
                   <span style="font-weight: 500; color: ${variance > 0 ? '#ff6b6b' : '#4caf50'}">
                     ${variance > 0 ? '+' : ''}${variance} days (${variance > 0 ? '+' : ''}${percentVariance}%)
                   </span>
                 </div>
               </div>`
            );
        })
        .on('mousemove', function (event) {
          // Smart positioning for the tooltip during mouse movement
          const mouseX = event.pageX;
          const mouseY = event.pageY;

          // Calculate smart position for tooltip
          const tooltipWidth = 250;
          const tooltipHeight = 200;
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          // Check available space
          const spaceOnRight = windowWidth - mouseX;
          const spaceOnBottom = windowHeight - mouseY;

          // Position tooltip to ensure it stays in viewport
          const showOnLeft = spaceOnRight < tooltipWidth + 20;
          const showAbove = spaceOnBottom < tooltipHeight + 20;

          tooltip
            .style('left', showOnLeft ? `${mouseX - tooltipWidth - 10}px` : `${mouseX + 10}px`)
            .style('top', showAbove ? `${mouseY - tooltipHeight - 10}px` : `${mouseY + 10}px`);
        })
        .on('mouseout', function () {
          // Reset bar appearance
          d3.select(this).attr('opacity', 0.8);
          // Hide tooltip
          tooltip.style('opacity', '0');
        });

      // Add indicators between planned and actual (without vertical connection lines)
      validData.forEach(d => {
        const plannedStart = new Date(d.planned_start_date).getTime();
        const plannedEnd = new Date(d.planned_finish_date).getTime();
        const actualStart = new Date(d.actual_start_date).getTime();
        const actualEnd = new Date(d.actual_finish_date).getTime();

        const plannedY = yScale(`${d.gantt_chart_legend} (Planned)`)! + yScale.bandwidth();
        const actualY = yScale(`${d.gantt_chart_legend} (Actual)`)!;

        // Check for overlaps first (more inclusive condition)
        // Consider an overlap if any part of the planned and actual periods coincide
        // or if they are exactly adjacent (one ends exactly when the other starts)
        if (
          // Check if there's any overlap between planned and actual periods
          (actualStart <= plannedEnd && actualEnd >= plannedStart) ||
          // Or if they are exactly adjacent (no gap)
          actualStart === plannedEnd ||
          plannedStart === actualEnd
        ) {
          // There's an overlap - determine the overlapping period
          const overlapStart = Math.max(plannedStart, actualStart);
          const overlapEnd = Math.min(plannedEnd, actualEnd);

          // Only create overlap indicator if there's a valid overlap period
          if (overlapEnd >= overlapStart) {
            const overlapWidth = xScale(new Date(overlapEnd)) - xScale(new Date(overlapStart));
            const overlapX = xScale(new Date(overlapStart));
            const overlapY = Math.min(plannedY, actualY);
            const overlapHeight = Math.abs(actualY - plannedY);

            // Add the visual overlap indicator
            chartContent
              .append('rect')
              .datum(d)
              .attr('class', 'overlap-indicator')
              .attr('x', overlapX)
              .attr('y', overlapY)
              .attr('width', overlapWidth)
              .attr('height', overlapHeight)
              .attr('fill', '#4caf50')
              .attr('opacity', 0.6)
              .attr('rx', 2)
              .attr('ry', 2);

            // Add invisible interactive rectangle for the overlap indicator
            interactionLayer
              .append('rect')
              .datum(d)
              .attr('class', 'overlap-indicator-interaction')
              .attr('x', overlapX)
              .attr('y', overlapY)
              .attr('width', overlapWidth)
              .attr('height', overlapHeight)
              .attr('fill', 'transparent')
              .style('pointer-events', 'all')
              .style('cursor', 'pointer')
              .on('mouseover', function(event) {
                d3.select(this).attr('opacity', 0.8);
                const overlap = overlapEnd - overlapStart;
                const overlapDays = Math.round(overlap / (1000 * 60 * 60 * 24));

                // Calculate percentage of overlap relative to planned duration
                const plannedDuration = (plannedEnd - plannedStart) / (1000 * 60 * 60 * 24);
                const overlapPercentage = ((overlapDays / plannedDuration) * 100).toFixed(1);

                tooltip
                  .style('opacity', '1')
                  .style('left', `${event.pageX + 10}px`)
                  .style('top', `${event.pageY - 20}px`)
                  .html(
                    `<div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Schedule Overlap</div>
                     <div style="display: flex; flex-direction: column; gap: 8px;">
                       <div style="display: flex; justify-content: space-between;">
                         <span style="color: #4b5563;">Project:</span>
                         <span style="font-weight: 500;">${d.project_code}</span>
                       </div>
                       <div style="display: flex; justify-content: space-between;">
                         <span style="color: #4b5563;">Stage:</span>
                         <span style="font-weight: 500;">${d.gantt_chart_legend}</span>
                       </div>
                       <div style="display: flex; justify-content: space-between;">
                         <span style="color: #4b5563;">Overlap Start:</span>
                         <span style="font-weight: 500;">${new Date(overlapStart).toLocaleDateString()}</span>
                       </div>
                       <div style="display: flex; justify-content: space-between;">
                         <span style="color: #4b5563;">Overlap End:</span>
                         <span style="font-weight: 500;">${new Date(overlapEnd).toLocaleDateString()}</span>
                       </div>
                       <div style="display: flex; justify-content: space-between;">
                         <span style="color: #4b5563;">Overlap Duration:</span>
                         <span style="font-weight: 500; color: "#4caf50";">${overlapDays} days (${overlapPercentage}% of planned)</span>
                       </div>
                       <div style="margin-top: 4px; font-size: 12px; color: #6b7280; font-style: italic;">
                         This indicates a period where planned and actual schedules were running concurrently.
                       </div>
                     </div>`
                  );
              })
              .on('mouseout', function() {
                d3.select(this).attr('opacity', 0.6);
                tooltip.style('opacity', '0');
              })
              .on('mousemove', function(event) {
                // Smart positioning for the tooltip during mouse movement
                const mouseX = event.pageX;
                const mouseY = event.pageY;

                // Calculate smart position for tooltip
                const tooltipWidth = 300;
                const tooltipHeight = 220;
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;

                // Check available space
                const spaceOnRight = windowWidth - mouseX;
                const spaceOnBottom = windowHeight - mouseY;

                // Position tooltip to ensure it stays in viewport
                const showOnLeft = spaceOnRight < tooltipWidth + 20;
                const showAbove = spaceOnBottom < tooltipHeight + 20;

                tooltip
                  .style('left', showOnLeft ? `${mouseX - tooltipWidth - 10}px` : `${mouseX + 10}px`)
                  .style('top', showAbove ? `${mouseY - tooltipHeight - 10}px` : `${mouseY + 10}px`);
              });
          }
        }
        // If no overlap, check for gap
        else if (actualStart > plannedEnd) {
          // There's a gap (actual starts after planned ends)
          // Extend the gap to start from the planned start date (SS relationship)
          const gapWidth = xScale(new Date(actualStart)) - xScale(new Date(d.planned_start_date));
          const gapX = xScale(new Date(d.planned_start_date)); // Start from planned start date
          const gapY = Math.min(plannedY, actualY);
          const gapHeight = Math.abs(actualY - plannedY);

          // Add the visual gap indicator
          chartContent
            .append('rect')
            .datum(d)
            .attr('class', 'gap-indicator')
            .attr('x', gapX)
            .attr('y', gapY)
            .attr('width', gapWidth)
            .attr('height', gapHeight)
            .attr('fill', '#ffb414')
            .attr('opacity', 0.6)
            .attr('rx', 2)
            .attr('ry', 2);

          // Add invisible interactive rectangle for the gap indicator
          interactionLayer
            .append('rect')
            .datum(d)
            .attr('class', 'gap-indicator-interaction')
            .attr('x', gapX)
            .attr('y', gapY)
            .attr('width', gapWidth)
            .attr('height', gapHeight)
            .attr('fill', 'transparent')
            .style('pointer-events', 'all')
            .style('cursor', 'pointer')
            .on('mouseover', function(event) {
              d3.select(this).attr('opacity', 0.8);

              // Calculate the total gap duration from planned start to actual start
              const totalGapDays = Math.round((actualStart - new Date(d.planned_start_date).getTime()) / (1000 * 60 * 60 * 24));

              tooltip
                .style('opacity', '1')
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 20}px`)
                .html(
                  `<div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Schedule Gap</div>
                   <div style="display: flex; flex-direction: column; gap: 8px;">
                     <div style="display: flex; justify-content: space-between;">
                       <span style="color: #4b5563;">Project:</span>
                       <span style="font-weight: 500;">${d.project_code}</span>
                     </div>
                     <div style="display: flex; justify-content: space-between;">
                       <span style="color: #4b5563;">Stage:</span>
                       <span style="font-weight: 500;">${d.gantt_chart_legend}</span>
                     </div>
                     <div style="display: flex; justify-content: space-between;">
                       <span style="color: #4b5563;">Planned Start:</span>
                       <span style="font-weight: 500;">${new Date(d.planned_start_date).toLocaleDateString()}</span>
                     </div>
                     <div style="display: flex; justify-content: space-between;">
                       <span style="color: #4b5563;">Actual Start:</span>
                       <span style="font-weight: 500;">${new Date(actualStart).toLocaleDateString()}</span>
                     </div>
                     <div style="display: flex; justify-content: space-between;">
                       <span style="color: #4b5563;">Total Gap Duration:</span>
                       <span style="font-weight: 500; color: "#ffb414";">${totalGapDays} days</span>
                     </div>
                     <div style="margin-top: 4px; font-size: 12px; color: #6b7280; font-style: italic;">
                       This indicates the total gap period from planned start to actual start (SS relationship).
                       The gap starts at the same time as the planned timeline (Start-to-Start).
                     </div>
                   </div>`
                );
            })
            .on('mouseout', function() {
              d3.select(this).attr('opacity', 0.6);
              tooltip.style('opacity', '0');
            })
            .on('mousemove', function(event) {
              // Smart positioning for the tooltip during mouse movement
              const mouseX = event.pageX;
              const mouseY = event.pageY;

              // Calculate smart position for tooltip
              const tooltipWidth = 300;
              const tooltipHeight = 240; // Increased height for additional content
              const windowWidth = window.innerWidth;
              const windowHeight = window.innerHeight;

              // Check available space
              const spaceOnRight = windowWidth - mouseX;
              const spaceOnBottom = windowHeight - mouseY;

              // Position tooltip to ensure it stays in viewport
              const showOnLeft = spaceOnRight < tooltipWidth + 20;
              const showAbove = spaceOnBottom < tooltipHeight + 20;

              tooltip
                .style('left', showOnLeft ? `${mouseX - tooltipWidth - 10}px` : `${mouseX + 10}px`)
                .style('top', showAbove ? `${mouseY - tooltipHeight - 10}px` : `${mouseY + 10}px`);
            });
        }
      });

      // Add x-axis
      const xAxis = g
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(isPreview ? 5 : 10));

      // Style x-axis
      applyAxisStyles(xAxis, true);

      // Add y-axis with wrapped text
      const yAxis = g
        .append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale));

      // Style y-axis and apply text wrapping
      applyAxisStyles(yAxis, false);

      // Apply text wrapping to y-axis labels
      yAxis.selectAll('.tick text')
        .call(function(text) {
          text.each(function(d: any) {
            const textElement = d3.select(this);
            const words = formatYAxisLabel(d).split('\n');

            textElement.text(''); // Clear existing text

            // Add each line as a separate tspan element
            words.forEach((word, i) => {
              textElement.append('tspan')
                .attr('x', -9) // Adjust x position for alignment
                .attr('dy', i === 0 ? 0 : '1.2em') // Add line spacing for subsequent lines
                .text(word);
            });
          });
        });

      // Adjust the left margin based on the new multiline labels
      yAxis.selectAll('.tick text')
        .attr('transform', 'translate(-8,0)');

      // Add x-axis label
      xAxis
        .append('text')
        .attr('x', width / 2)
        .attr('y', isPreview ? 45 : 55)
        .attr('fill', '#77868F')
        .attr('text-anchor', 'middle')
        .style('font-size', isPreview ? '12px' : '14px')
        .style('font-family', 'var(--e-font-family-rubik)')
        .style('font-weight', '400')
        .text('Timeline');

      // Add legend
      if (!isPreview) {
        const legendX = width - 200;
        const legendY = -30;

        // Planned bar legend
        g.append('rect')
          .attr('x', legendX)
          .attr('y', legendY)
          .attr('width', 20)
          .attr('height', 10)
          .attr('fill', '#4e79a7')
          .attr('opacity', 0.7)
          .attr('rx', 4)
          .attr('ry', 4);

        g.append('text')
          .attr('x', legendX + 30)
          .attr('y', legendY + 8)
          .text('Planned')
          .style('font-family', 'var(--e-font-family-rubik)')
          .style('font-size', '12px')
          .style('fill', '#77868F');

        // Actual bar legend
        g.append('rect')
          .attr('x', legendX)
          .attr('y', legendY + 20)
          .attr('width', 20)
          .attr('height', 10)
          .attr('fill', d3.color('#4e79a7')!.darker(0.3).toString())
          .attr('opacity', 0.8)
          .attr('rx', 4)
          .attr('ry', 4);

        g.append('text')
          .attr('x', legendX + 30)
          .attr('y', legendY + 28)
          .text('Actual')
          .style('font-family', 'var(--e-font-family-rubik)')
          .style('font-size', '12px')
          .style('fill', '#77868F');

        // Gap indicator in legend
        g.append('rect')
          .attr('x', legendX)
          .attr('y', legendY + 40)
          .attr('width', 20)
          .attr('height', 10)
          .attr('fill', '#ffb414')
          .attr('opacity', 0.6)
          .attr('rx', 2)
          .attr('ry', 2);

        g.append('text')
          .attr('x', legendX + 30)
          .attr('y', legendY + 48)
          .text('Gap')
          .style('font-family', 'var(--e-font-family-rubik)')
          .style('font-size', '12px')
          .style('fill', '#77868F');

        // Overlap indicator in legend
        g.append('rect')
          .attr('x', legendX)
          .attr('y', legendY + 60)
          .attr('width', 20)
          .attr('height', 10)
          .attr('fill', '#4caf50')
          .attr('opacity', 0.6)
          .attr('rx', 2)
          .attr('ry', 2);

        g.append('text')
          .attr('x', legendX + 30)
          .attr('y', legendY + 68)
          .text('Overlap')
          .style('font-family', 'var(--e-font-family-rubik)')
          .style('font-size', '12px')
          .style('fill', '#77868F');


      }

      // Add zoom helper text if not in preview mode
      if (!isPreview) {
        svg
          .append('text')
          .attr('x', width + margin.left - 10)
          .attr('y', margin.top - 10)
          .attr('text-anchor', 'end')
          .style('font-size', '12px')
          .style('font-family', 'var(--e-font-family-rubik)')
          .style('fill', '#77868F')
          .text('Drag to pan in any direction, use mouse wheel to zoom');
      }

      // Create a transparent overlay for better interaction
      // Place it at the beginning of the chartContent to ensure it's behind other elements
      const zoomRect = chartContent
        .insert('rect', ':first-child') // Insert as first child
        .attr('class', 'zoom-rect')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .style('touch-action', 'none'); // Allow all panning directions

      // Add zoom behavior with improved performance and y-axis panning
      const zoom = d3
        .zoom<SVGRectElement, unknown>()
        .scaleExtent([0.5, 5]) // Limit zoom scale
        .extent([
          [0, 0],
          [width, height],
        ])
        .filter(event => {
          // Always allow zoom for mouse wheel events
          if (event.type === 'wheel') return true;

          // Only allow pan with left mouse button (no right-click)
          return !event.button;
        })
        .on('zoom', (event) => {
          // Apply transform to content group
          const transform = event.transform;

          // Create new scaled x-axis and y-axis
          const newXScale = transform.rescaleX(xScale);

          // Calculate the new y-scale with proper bandwidth based on the transform
          const newYScale = d3.scaleBand()
            .domain(yScale.domain())
            .range([transform.applyY(0), transform.applyY(height)])
            .padding(0.15);

          // Calculate the scaled bandwidth for proper bar heights
          const scaledBandwidth = newYScale.bandwidth();

          // Update axes with smooth transitions
          xAxis
            .call(d3.axisBottom(newXScale).ticks(isPreview ? 5 : 10) as any);

          // Update y-axis
          yAxis
            .call(d3.axisLeft(newYScale) as any);

          // Re-apply text wrapping to y-axis labels after update
          yAxis.selectAll('.tick text')
            .call(function(text) {
              text.each(function(d: any) {
                const textElement = d3.select(this);
                const words = formatYAxisLabel(d).split('\n');

                textElement.text(''); // Clear existing text

                // Add each line as a separate tspan element
                words.forEach((word, i) => {
                  textElement.append('tspan')
                    .attr('x', -9) // Adjust x position for alignment
                    .attr('dy', i === 0 ? 0 : '1.2em') // Add line spacing for subsequent lines
                    .text(word);
                });
              });
            })
            .attr('transform', 'translate(-8,0)');

          // Immediately apply styling to prevent flicker
          applyAxisStyles(xAxis, true);
          applyAxisStyles(yAxis, false);

          // Update grid lines
          g.selectAll('.x-grid')
            .attr('x1', (d: any) => newXScale(d))
            .attr('x2', (d: any) => newXScale(d))
            .attr('y2', height);

          // Update bars - direct update without transition for better performance
          chartContent
            .selectAll('.planned-bar')
            .attr('x', (d: any) => newXScale(new Date(d.planned_start_date)))
            .attr('y', (d: any) => transform.applyY(yScale(`${d.gantt_chart_legend} (Planned)`)!))
            .attr('width', (d: any) => {
              const start = newXScale(new Date(d.planned_start_date));
              const end = newXScale(new Date(d.planned_finish_date));
              return Math.max(0, end - start);
            })
            .attr('height', scaledBandwidth);

          // Update interaction rectangles for planned bars
          interactionLayer
            .selectAll('.planned-bar-interaction')
            .attr('x', (d: any) => newXScale(new Date(d.planned_start_date)))
            .attr('y', (d: any) => transform.applyY(yScale(`${d.gantt_chart_legend} (Planned)`)!))
            .attr('width', (d: any) => {
              const start = newXScale(new Date(d.planned_start_date));
              const end = newXScale(new Date(d.planned_finish_date));
              return Math.max(0, end - start);
            })
            .attr('height', scaledBandwidth);

          chartContent
            .selectAll('.actual-bar')
            .attr('x', (d: any) => newXScale(new Date(d.actual_start_date)))
            .attr('y', (d: any) => transform.applyY(yScale(`${d.gantt_chart_legend} (Actual)`)!))
            .attr('width', (d: any) => {
              const start = newXScale(new Date(d.actual_start_date));
              const end = newXScale(new Date(d.actual_finish_date));
              return Math.max(0, end - start);
            })
            .attr('height', scaledBandwidth);

          // Update interaction rectangles for actual bars
          interactionLayer
            .selectAll('.actual-bar-interaction')
            .attr('x', (d: any) => newXScale(new Date(d.actual_start_date)))
            .attr('y', (d: any) => transform.applyY(yScale(`${d.gantt_chart_legend} (Actual)`)!))
            .attr('width', (d: any) => {
              const start = newXScale(new Date(d.actual_start_date));
              const end = newXScale(new Date(d.actual_finish_date));
              return Math.max(0, end - start);
            })
            .attr('height', scaledBandwidth);

          // Reposition gap indicators with full width - now starting from planned start (SS relationship)
          chartContent
            .selectAll('.gap-indicator')
            .attr('x', (d: any) => {
              // Start from planned start date (SS relationship)
              return newXScale(new Date(d.planned_start_date));
            })
            .attr('y', (d: any) => {
              const plannedY = yScale(`${d.gantt_chart_legend} (Planned)`)! + yScale.bandwidth();
              const actualY = yScale(`${d.gantt_chart_legend} (Actual)`)!;
              return transform.applyY(Math.min(plannedY, actualY));
            })
            .attr('width', (d: any) => {
              // Width is from planned start to actual start
              const plannedStart = new Date(d.planned_start_date).getTime();
              const actualStart = new Date(d.actual_start_date).getTime();
              return newXScale(new Date(actualStart)) - newXScale(new Date(plannedStart));
            })
            .attr('height', (d: any) => {
              // Calculate the distance between the centers of the two bands and add one bandwidth
              const plannedY = transform.applyY(yScale(`${d.gantt_chart_legend} (Planned)`)! + yScale.bandwidth());
              const actualY = transform.applyY(yScale(`${d.gantt_chart_legend} (Actual)`)!);
              return Math.abs(actualY - plannedY);
            });

          // Also update the interaction rectangles for gaps - now starting from planned start (SS relationship)
          interactionLayer
            .selectAll('.gap-indicator-interaction')
            .attr('x', (d: any) => {
              // Start from planned start date (SS relationship)
              return newXScale(new Date(d.planned_start_date));
            })
            .attr('y', (d: any) => {
              const plannedY = yScale(`${d.gantt_chart_legend} (Planned)`)! + yScale.bandwidth();
              const actualY = yScale(`${d.gantt_chart_legend} (Actual)`)!;
              return transform.applyY(Math.min(plannedY, actualY));
            })
            .attr('width', (d: any) => {
              // Width is from planned start to actual start
              const plannedStart = new Date(d.planned_start_date).getTime();
              const actualStart = new Date(d.actual_start_date).getTime();
              return newXScale(new Date(actualStart)) - newXScale(new Date(plannedStart));
            })
            .attr('height', (d: any) => {
              // Calculate the distance between the centers of the two bands and add one bandwidth
              const plannedY = transform.applyY(yScale(`${d.gantt_chart_legend} (Planned)`)! + yScale.bandwidth());
              const actualY = transform.applyY(yScale(`${d.gantt_chart_legend} (Actual)`)!);
              return Math.abs(actualY - plannedY);
            });

          // Reposition overlap indicators with full width - improved overlap detection
          chartContent
            .selectAll('.overlap-indicator')
            .attr('x', (d: any) => {
              const plannedStart = new Date(d.planned_start_date).getTime();
              const actualStart = new Date(d.actual_start_date).getTime();
              // Get the later of the two start dates
              const overlapStart = Math.max(plannedStart, actualStart);
              return newXScale(new Date(overlapStart));
            })
            .attr('y', (d: any) => {
              const plannedY = yScale(`${d.gantt_chart_legend} (Planned)`)! + yScale.bandwidth();
              const actualY = yScale(`${d.gantt_chart_legend} (Actual)`)!;
              return transform.applyY(Math.min(plannedY, actualY));
            })
            .attr('width', (d: any) => {
              const plannedStart = new Date(d.planned_start_date).getTime();
              const plannedEnd = new Date(d.planned_finish_date).getTime();
              const actualStart = new Date(d.actual_start_date).getTime();
              const actualEnd = new Date(d.actual_finish_date).getTime();

              // Get the later of the two start dates
              const overlapStart = Math.max(plannedStart, actualStart);
              // Get the earlier of the two end dates
              const overlapEnd = Math.min(plannedEnd, actualEnd);

              // Only return a positive width if there's a valid overlap
              return Math.max(0, newXScale(new Date(overlapEnd)) - newXScale(new Date(overlapStart)));
            })
            .attr('height', (d: any) => {
              // Calculate the distance between the centers of the two bands and add one bandwidth
              const plannedY = transform.applyY(yScale(`${d.gantt_chart_legend} (Planned)`)! + yScale.bandwidth());
              const actualY = transform.applyY(yScale(`${d.gantt_chart_legend} (Actual)`)!);
              return Math.abs(actualY - plannedY);
            });

          // Also update the interaction rectangles for overlaps - improved overlap detection
          interactionLayer
            .selectAll('.overlap-indicator-interaction')
            .attr('x', (d: any) => {
              const plannedStart = new Date(d.planned_start_date).getTime();
              const actualStart = new Date(d.actual_start_date).getTime();
              // Get the later of the two start dates
              const overlapStart = Math.max(plannedStart, actualStart);
              return newXScale(new Date(overlapStart));
            })
            .attr('y', (d: any) => {
              const plannedY = yScale(`${d.gantt_chart_legend} (Planned)`)! + yScale.bandwidth();
              const actualY = yScale(`${d.gantt_chart_legend} (Actual)`)!;
              return transform.applyY(Math.min(plannedY, actualY));
            })
            .attr('width', (d: any) => {
              const plannedStart = new Date(d.planned_start_date).getTime();
              const plannedEnd = new Date(d.planned_finish_date).getTime();
              const actualStart = new Date(d.actual_start_date).getTime();
              const actualEnd = new Date(d.actual_finish_date).getTime();

              // Get the later of the two start dates
              const overlapStart = Math.max(plannedStart, actualStart);
              // Get the earlier of the two end dates
              const overlapEnd = Math.min(plannedEnd, actualEnd);

              // Only return a positive width if there's a valid overlap
              return Math.max(0, newXScale(new Date(overlapEnd)) - newXScale(new Date(overlapStart)));
            })
            .attr('height', (d: any) => {
              // Calculate the distance between the centers of the two bands and add one bandwidth
              const plannedY = transform.applyY(yScale(`${d.gantt_chart_legend} (Planned)`)! + yScale.bandwidth());
              const actualY = transform.applyY(yScale(`${d.gantt_chart_legend} (Actual)`)!);
              return Math.abs(actualY - plannedY);
            });
        });

      // Add visual indicator for when panning is active
      const panIndicator = svg
        .append('text')
        .attr('class', 'pan-indicator')
        .attr('x', (width + margin.left + margin.right) / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-family', 'var(--e-font-family-rubik)')
        .style('font-weight', 'bold')
        .style('fill', '#149ef6')
        .style('opacity', '0')
        .text('Panning active');

      // Apply zoom behavior to the zoom rect
      // This ensures zoom/pan works consistently across the entire chart
      zoomRect
        .call(zoom as any)
        .on('mousedown.indicator', function (event) {
          // Don't show indicator for right-click
          if (event.button !== 2) {
            // Show panning indicator when mouse is down
            panIndicator.transition().duration(200).style('opacity', '0.8');
          }
        })
        .on('mouseup.indicator', function () {
          // Hide panning indicator when mouse is up
          panIndicator.transition().duration(200).style('opacity', '0');
        })
        .on('mouseleave.indicator', function () {
          // Hide panning indicator when mouse leaves
          panIndicator.transition().duration(200).style('opacity', '0');
        });

      // Add double-click to reset zoom
      zoomRect.on('dblclick', () => {
        // Use smoother easing for reset animation
        zoomRect
          .transition()
          .duration(400)
          .ease(d3.easeCubicInOut)
          .call(zoom.transform as any, d3.zoomIdentity);
      });
    };

    // Initial render
    renderChart();

    // Set up ResizeObserver for responsive updates
    let resizeTimeout: NodeJS.Timeout | null = null;
    const resizeObserver = new ResizeObserver((entries) => {
      // Clear previous timeout
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      // Debounce the resize event
      resizeTimeout = setTimeout(() => {
        const entry = entries[0];
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;

        // Only update if dimensions have actually changed
        if (newWidth > 0 && (isPreview || newHeight > 0)) {
          // Don't remove the tooltip, just hide it temporarily during resizing
          d3.select('.combined-gantt-chart-tooltip').style('opacity', '0');
          renderChart();
        }
      }, 100);
    });

    // Start observing the container for resize events
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Clean up on component unmount
    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeObserver.disconnect();

      // Don't remove the tooltip, just hide it
      tooltip.style('opacity', '0');

      // Add a small delay before actually hiding it to prevent flicker during transitions
      setTimeout(() => {
        // Only hide if component is truly unmounted
        const tooltipElement = document.querySelector('.combined-gantt-chart-tooltip');
        if (tooltipElement && !document.contains(svgRef.current)) {
          tooltip.style('display', 'none');
        }
      }, 50);
    };
  }, [data, isPreview]);

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[350px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[350px] text-red-500">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[350px] text-gray-500">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">No Data Available</div>
          <div>No chart data available for the selected project.</div>
        </div>
      </div>
    );
  }

  // Render the chart
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
        minHeight: isPreview ? '350px' : '100%',
        maxHeight: isPreview ? '350px' : 'none',
        flex: 1,
      }}
    >
      <svg ref={svgRef} className="w-full h-full" />

      {data && data.length > 0 && (
        <div
          className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white p-1 rounded shadow-sm"
          style={{ fontSize: '11px', opacity: 0.9 }}
        >
          Note: Incomplete data points are not displayed
        </div>
      )}
    </div>
  );
};