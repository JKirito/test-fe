'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { NoDataMessage } from './NoDataMessage';

interface GanttData {
  name: string;
  phase: string;
  duration: number;
  startTime: number;
  color: string;
  metric: string;
  // Optional planned schedule (absolute timestamps in ms)
  planned?: {
    start: number;
    end: number;
  };
}

interface GanttChartProps {
  data: GanttData[] | null;
  isPreview?: boolean;
}

export const CustomGanttChart: React.FC<GanttChartProps> = ({ data, isPreview = false }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data || data.length === 0) {
      return;
    }

    // console.log('CustomGanttChart: Rendering with data', data);

    // Create a stable tooltip reference
    // First, remove any orphaned tooltips that might exist from previous renders
    const existingTooltips = d3
      .select('body')
      .selectAll<HTMLDivElement, unknown>('.gantt-chart-tooltip');
    if (existingTooltips.size() > 1) {
      // Keep only the first one and remove others to avoid duplicates
      existingTooltips
        .nodes()
        .slice(1)
        .forEach((node) => node.remove());
    }

    // Get or create the tooltip
    let tooltip = d3.select('body').select<HTMLDivElement>('.gantt-chart-tooltip');
    if (tooltip.empty()) {
      // console.log('CustomGanttChart: Creating new tooltip');
      tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'gantt-chart-tooltip')
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
        .style('box-shadow', '0 4px 6px rgba(0,0,0,0.1)')
        .style('font-family', 'var(--e-font-family-rubik)')
        .style('opacity', '0') // Start with opacity 0 instead of display none
        .style('transition', 'opacity 0.15s'); // Add smooth transition
    } else {
      // console.log('CustomGanttChart: Using existing tooltip');
    }

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Get container dimensions
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    const margin = {
      top: isPreview ? 30 : 40,
      right: isPreview ? 50 : 80,
      bottom: isPreview ? 60 : 80,
      left: isPreview ? 120 : 180,
    };

    const width = containerRect.width - margin.left - margin.right;
    const baseHeight = isPreview ? 350 : 600;
    const height = baseHeight - margin.top - margin.bottom;

    // Create SVG with responsive dimensions
    const svg = d3
      .select(svgRef.current)
      .attr('width', containerRect.width)
      .attr('height', containerRect.height)
      .attr('viewBox', `0 0 ${containerRect.width} ${baseHeight}`)
      .attr('preserveAspectRatio', isPreview ? 'xMinYMin meet' : 'xMidYMid meet');

    // Create main group
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    // Find the earliest start time and latest end time across all data points
    let minStartTime = Infinity;
    let maxEndTime = -Infinity;

    data.forEach((item) => {
      // Find the earliest start time (either planned or actual)
      if (item.planned && item.planned.start) {
        minStartTime = Math.min(minStartTime, new Date(item.planned.start).getTime());
      }
      minStartTime = Math.min(minStartTime, item.startTime);

      // Find the latest end time (either planned or actual)
      if (item.planned && item.planned.end) {
        maxEndTime = Math.max(maxEndTime, new Date(item.planned.end).getTime());
      }
      maxEndTime = Math.max(maxEndTime, item.startTime + item.duration);
    });

    // If we couldn't find valid times, use fallbacks
    if (minStartTime === Infinity) minStartTime = data[0].startTime;
    if (maxEndTime === -Infinity) maxEndTime = data[0].startTime + data[0].duration;

    // Add padding if needed (currently none)
    const paddedMinTime = minStartTime;
    const paddedMaxTime = maxEndTime;

    // Create a time-based scale for the x-axis
    const xScale = d3
      .scaleLinear()
      .domain([0, paddedMaxTime - paddedMinTime])
      .range([0, width]);
    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, height])
      .padding(0.4);

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

    // Create a group for chart content with clip path
    const chartContent = g
      .append('g')
      .attr('class', 'chart-content')
      .attr('clip-path', `url(#${clipId})`);

    // Function to find overlaps and gaps
    const findOverlapsAndGaps = (data: GanttData[]) => {
      const overlaps: {
        start: Date;
        end: Date;
        phases: GanttData[];
      }[] = [];
      const gaps: {
        start: Date;
        end: Date;
        beforePhase: GanttData;
        afterPhase: GanttData;
      }[] = [];

      // Sort data by actual start date
      const sortedData = [...data].sort((a, b) => a.startTime - b.startTime);

      // Find overlaps
      for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j < data.length; j++) {
          const phase1 = data[i];
          const phase2 = data[j];

          if (
            phase1.startTime <= phase2.startTime + phase2.duration &&
            phase2.startTime <= phase1.startTime + phase1.duration
          ) {
            const start = new Date(Math.max(phase1.startTime, phase2.startTime));
            const end = new Date(
              Math.min(phase1.startTime + phase1.duration, phase2.startTime + phase2.duration)
            );
            overlaps.push({ start, end, phases: [phase1, phase2] });
          }
        }
      }

      // Find gaps
      for (let i = 0; i < sortedData.length - 1; i++) {
        const currentPhase = sortedData[i];
        const nextPhase = sortedData[i + 1];

        if (currentPhase.startTime + currentPhase.duration < nextPhase.startTime) {
          gaps.push({
            start: new Date(currentPhase.startTime + currentPhase.duration),
            end: new Date(nextPhase.startTime),
            beforePhase: currentPhase,
            afterPhase: nextPhase,
          });
        }
      }

      return { overlaps, gaps };
    };

    const { overlaps, gaps } = findOverlapsAndGaps(data);

    // Add overlap highlights
    chartContent
      .selectAll('.overlap-bar')
      .data(overlaps)
      .enter()
      .append('rect')
      .attr('class', 'overlap-bar')
      .attr('x', (d) => xScale(d.start.getTime() - paddedMinTime))
      .attr('y', 0)
      .attr('width', (d) =>
        Math.max(
          0,
          xScale(d.end.getTime() - paddedMinTime) - xScale(d.start.getTime() - paddedMinTime)
        )
      )
      .attr('height', height)
      .attr('fill', '#FF6B6B')
      .attr('opacity', 0.5)
      .on('mouseover', function (event, d) {
        // Stop event propagation to prevent parent elements from triggering mouseout
        event.stopPropagation();

        // console.log('CustomGanttChart: Overlap bar mouseover', d);

        d3.select(this).attr('opacity', 0.8);
        const mouseX = event.pageX;
        const mouseY = event.pageY;

        tooltip
          .style('opacity', '1') // Use opacity instead of visibility
          .style('display', 'block') // Ensure it's displayed
          .style('left', `${mouseX + 20}px`)
          .style('top', `${mouseY - 20}px`)
          .html(
            `<div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Overlap Period</div>
             <div style="display: flex; flex-direction: column; gap: 8px;">
               <div style="display: flex; justify-content: space-between;">
                 <span style="color: #4b5563;">Period:</span>
                 <span style="font-weight: 500;">${d.start.toLocaleDateString()} - ${d.end.toLocaleDateString()}</span>
               </div>
               <div style="border-top: 1px solid #e5e7eb; margin: 8px 0;"></div>
               <div style="display: flex; flex-direction: column; gap: 4px;">
                 <span style="color: #4b5563;">Overlapping Phases:</span>
                 ${d.phases.map((p) => `<span style="font-weight: 500; margin-left: 8px;">- ${p.name}</span>`).join('')}
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

        // console.log('CustomGanttChart: Overlap bar mouseout');

        d3.select(this).attr('opacity', 0.5);
        tooltip.style('opacity', '0'); // Use opacity instead of visibility
      });

    // Add gap highlights
    chartContent
      .selectAll('.gap-bar')
      .data(gaps)
      .enter()
      .append('rect')
      .attr('class', 'gap-bar')
      .attr('x', (d) => xScale(d.start.getTime() - paddedMinTime))
      .attr('y', 0)
      .attr('width', (d) =>
        Math.max(
          0,
          xScale(d.end.getTime() - paddedMinTime) - xScale(d.start.getTime() - paddedMinTime)
        )
      )
      .attr('height', height)
      .attr('fill', '#ffb414')
      .attr('opacity', 0.5)
      .on('mouseover', function (event, d) {
        // Stop event propagation to prevent parent elements from triggering mouseout
        event.stopPropagation();

        // console.log('CustomGanttChart: Gap bar mouseover', d);

        d3.select(this).attr('opacity', 0.8);
        const mouseX = event.pageX;
        const mouseY = event.pageY;

        tooltip
          .style('opacity', '1') // Use opacity instead of visibility
          .style('display', 'block') // Ensure it's displayed
          .style('left', `${mouseX + 20}px`)
          .style('top', `${mouseY - 20}px`)
          .html(
            `<div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Gap Period</div>
             <div style="display: flex; flex-direction: column; gap: 8px;">
               <div style="display: flex; justify-content: space-between;">
                 <span style="color: #4b5563;">Period:</span>
                 <span style="font-weight: 500;">${d.start.toLocaleDateString()} - ${d.end.toLocaleDateString()}</span>
               </div>
               <div style="border-top: 1px solid #e5e7eb; margin: 8px 0;"></div>
               <div style="display: flex; flex-direction: column; gap: 4px;">
                 <span style="color: #4b5563;">Between Phases:</span>
                 <span style="font-weight: 500; margin-left: 8px;">- ${d.beforePhase.name}</span>
                 <span style="font-weight: 500; margin-left: 8px;">- ${d.afterPhase.name}</span>
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

        // console.log('CustomGanttChart: Gap bar mouseout');

        d3.select(this).attr('opacity', 0.5);
        tooltip.style('opacity', '0'); // Use opacity instead of visibility
      });

    // Add actual bars
    chartContent
      .selectAll('.actual-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'actual-bar')
      .attr('x', (d) => xScale(d.startTime - paddedMinTime))
      .attr('y', (d) => yScale(d.name)!)
      .attr('width', (d) =>
        Math.max(
          0,
          xScale(d.startTime + d.duration - paddedMinTime) - xScale(d.startTime - paddedMinTime)
        )
      )
      .attr('height', yScale.bandwidth())
      .attr('fill', (d) => d.color)
      .attr('opacity', 0.8)
      .attr('rx', 6) // Add rounded corners
      .attr('ry', 6) // Add rounded corners
      .on('mouseover', function (event, d) {
        // Stop event propagation to prevent parent elements from triggering mouseout
        event.stopPropagation();

        // console.log('CustomGanttChart: Actual bar mouseover', d);

        d3.select(this).attr('opacity', 1);
        const mouseX = event.pageX;
        const mouseY = event.pageY;

        tooltip
          .style('opacity', '1') // Use opacity instead of visibility
          .style('display', 'block') // Ensure it's displayed
          .style('left', `${mouseX + 20}px`)
          .style('top', `${mouseY - 20}px`)
          .html(
            `<div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">${d.name}</div>
             <div style="display: flex; flex-direction: column; gap: 8px;">
               <div style="display: flex; justify-content: space-between;">
                 <span style="color: #4b5563;">Period:</span>
                 <span style="font-weight: 500;">${new Date(d.startTime).toLocaleDateString()} - ${new Date(d.startTime + d.duration * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
               </div>
               <div style="display: flex; justify-content: space-between;">
                 <span style="color: #4b5563;">Duration:</span>
                 <span style="font-weight: 500;">${d.duration.toFixed(1)} ${d.metric.toLowerCase()}</span>
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

        // console.log('CustomGanttChart: Actual bar mouseout');

        d3.select(this).attr('opacity', 0.8);
        tooltip.style('opacity', '0'); // Use opacity instead of visibility
      });

    // Add duration labels
    chartContent
      .selectAll('.duration-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'duration-label')
      .style('display', isPreview ? 'none' : 'block')
      .attr(
        'x',
        (d) =>
          xScale(d.startTime - paddedMinTime) +
          (xScale(d.startTime + d.duration - paddedMinTime) - xScale(d.startTime - paddedMinTime)) /
            2
      )
      .attr('y', (d) => yScale(d.name)! + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', '#004b84')
      .attr('font-family', 'var(--e-font-family-rubik)')
      .style('font-size', isPreview ? '12px' : '14px')
      .attr('font-weight', '400')
      .text((d) => `${d.duration.toFixed(1)}`);

    // Helper to style x-axis consistently
    const styleXAxis = (axisG: d3.Selection<SVGGElement, unknown, null, undefined>) => {
      axisG
        .selectAll<SVGTextElement, unknown>('.tick text')
        .style('font-family', 'var(--e-font-family-rubik)')
        .style('font-size', isPreview ? '12px' : '14px')
        .style('fill', '#77868F');

      axisG.selectAll('.tick line').style('stroke', '#ccc');
      axisG.select('.domain').style('stroke', '#ccc');
    };

    // Initial x-axis: show relative units (same as zoom handler for consistency)
    const xAxis = g
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickFormat((d) => `${(d as number).toFixed(1)}`)
      );

    // Apply consistent styling
    styleXAxis(xAxis);

    // Add y-axis
    const yAxis = g.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScale));

    // Style y-axis
    g.selectAll('.y-axis .tick text')
      .style('font-family', 'var(--e-font-family-rubik)')
      .style('font-size', isPreview ? '12px' : '14px')
      .style('font-weight', '400')
      .style('fill', '#0F1214')
      .attr('x', -8);

    yAxis.select('.domain').style('stroke', '#ccc');
    yAxis.selectAll('.tick line').style('stroke', '#ccc');

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

    // Add zoom helper text if not in preview mode
    if (!isPreview) {
      svg
        .append('text')
        .attr('x', containerRect.width - margin.right - 10)
        .attr('y', margin.top - 10)
        .attr('text-anchor', 'end')
        .style('font-size', '12px')
        .style('font-family', 'var(--e-font-family-rubik)')
        .style('fill', '#77868F')
        .text('Drag to pan, use mouse wheel to zoom, Alt+drag over bars');
    }

    // Add zoom behavior with filter to prevent zoom on bar interactions
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 5])
      .extent([
        [0, 0],
        [width, height],
      ])
      // Filter to allow zoom and pan while preventing interference with tooltips
      .filter((event) => {
        // Always allow wheel events for zooming
        if (event.type === 'wheel') return true;

        // For mouse events, check if we're over a bar or not
        // We need to check if the event target or any of its parent nodes is a bar
        const isOverBar = (element: any): boolean => {
          if (!element) return false;
          if (!element.classList) return false;

          // Check if this element is a bar
          if (
            element.classList.contains('actual-bar') ||
            element.classList.contains('overlap-bar') ||
            element.classList.contains('gap-bar')
          ) {
            return true;
          }

          // Check parent nodes up to 3 levels deep
          if (element.parentNode && element.parentNode.tagName) {
            return isOverBar(element.parentNode);
          }

          return false;
        };

        // Check if we're over a bar
        if (event.target && isOverBar(event.target)) {
          // If over a bar, only allow zoom/pan when Alt key is pressed
          return event.altKey;
        }

        // If not over a bar, allow all zoom/pan events
        return true;
      })
      .on('zoom', (event) => {
        const newXScale = event.transform.rescaleX(xScale);

        // Smooth transition for x-axis update
        xAxis
          .transition()
          .duration(100)
          .ease(d3.easeLinear)
          .call(
            d3
              .axisBottom(newXScale)
              .ticks(5)
              .tickFormat((d) => `${(d as number).toFixed(1)}`)
          )
          .on('end', () => styleXAxis(xAxis));

        // Smooth transition for updating actual bars
        chartContent
          .selectAll('.actual-bar')
          .transition()
          .duration(100)
          .ease(d3.easeLinear)
          .attr('x', (d: any) => newXScale(d.startTime - data[0].startTime))
          .attr('width', (d: any) =>
            Math.max(
              0,
              newXScale(d.startTime + d.duration - data[0].startTime) -
                newXScale(d.startTime - data[0].startTime)
            )
          );

        // Smooth transition for duration labels
        chartContent
          .selectAll('.duration-label')
          .transition()
          .duration(100)
          .ease(d3.easeLinear)
          .attr(
            'x',
            (d: any) =>
              newXScale(d.startTime - data[0].startTime) +
              (newXScale(d.startTime + d.duration - data[0].startTime) -
                newXScale(d.startTime - data[0].startTime)) /
                2
          );

        // Smooth transition for overlap highlights
        chartContent
          .selectAll('.overlap-bar')
          .transition()
          .duration(100)
          .ease(d3.easeLinear)
          .attr('x', (d: any) => newXScale(d.start.getTime() - data[0].startTime))
          .attr('width', (d: any) =>
            Math.max(
              0,
              newXScale(d.end.getTime() - data[0].startTime) -
                newXScale(d.start.getTime() - data[0].startTime)
            )
          );

        // Smooth transition for gap highlights
        chartContent
          .selectAll('.gap-bar')
          .transition()
          .duration(100)
          .ease(d3.easeLinear)
          .attr('x', (d: any) => newXScale(d.start.getTime() - data[0].startTime))
          .attr('width', (d: any) =>
            Math.max(
              0,
              newXScale(d.end.getTime() - data[0].startTime) -
                newXScale(d.start.getTime() - data[0].startTime)
            )
          );
      });

    // Add visual indicator for when panning is active
    const panIndicator = svg
      .append('text')
      .attr('class', 'pan-indicator')
      .attr('x', containerRect.width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-family', 'var(--e-font-family-rubik)')
      .style('font-weight', 'bold')
      .style('fill', '#149ef6')
      .style('opacity', '0')
      .text('Panning active');

    // Instead of using a zoom rect that blocks interactions, apply zoom to the SVG
    // This allows interactions with the bars while still enabling zoom functionality
    svg
      .call(zoom as any)
      .on('mousedown.indicator', function (event) {
        // Show panning indicator when mouse is down (potential pan)
        if (event && !isOverBar(event.target)) {
          panIndicator.transition().duration(200).style('opacity', '0.8');
        }
      })
      .on('mouseup.indicator', function () {
        // Hide panning indicator when mouse is up
        panIndicator.transition().duration(200).style('opacity', '0');
      })
      .on('mouseleave.indicator', function () {
        // Hide panning indicator when mouse leaves the SVG
        panIndicator.transition().duration(200).style('opacity', '0');
      });

    // Add double-click to reset zoom on the SVG
    svg.on('dblclick', () => {
      svg
        .transition()
        .duration(400)
        .call(zoom.transform as any, d3.zoomIdentity);
    });

    // Add a transparent overlay for pan/zoom that doesn't block bar interactions
    g.append('rect')
      .attr('class', 'pan-overlay')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', `translate(0,0)`)
      .style('fill', 'none')
      .style('pointer-events', 'none');

    // Helper function to check if an element is a bar
    function isOverBar(element: any): boolean {
      if (!element) return false;
      if (!element.classList) return false;

      // Check if this element is a bar
      if (
        element.classList.contains('actual-bar') ||
        element.classList.contains('overlap-bar') ||
        element.classList.contains('gap-bar')
      ) {
        return true;
      }

      // Check parent nodes up to 3 levels deep
      if (element.parentNode && element.parentNode.tagName) {
        return isOverBar(element.parentNode);
      }

      return false;
    }

    // Create a more robust cleanup function
    return () => {
      // console.log('CustomGanttChart: Cleanup function called');

      // Don't remove the tooltip on component unmount if it's being reused
      // Just hide it with opacity to avoid flicker on remount
      tooltip.style('opacity', '0');

      // Add a small delay before actually hiding it to prevent flicker during transitions
      setTimeout(() => {
        // Only hide if component is truly unmounted (check if tooltip still exists)
        const tooltipElement = document.querySelector('.gantt-chart-tooltip');
        if (tooltipElement && !document.contains(svgRef.current)) {
          // console.log('CustomGanttChart: Component truly unmounted, hiding tooltip');
          tooltip.style('opacity', '0');
        }
      }, 50);
    };
  }, [data, isPreview]);

  // If there's no data, show the NoDataMessage component
  if (!data || data.length === 0) {
    return <NoDataMessage isPreview={isPreview} message="No data available for gantt chart" />;
  }

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
    </div>
  );
};
