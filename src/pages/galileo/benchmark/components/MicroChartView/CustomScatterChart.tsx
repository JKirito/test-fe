'use client';

import { getLinePoints, Point, calculateLinearRegression } from '@/lib/utils/regression';
import * as d3 from 'd3';
import { useLayoutEffect, useRef } from 'react';
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
  displayMode?: 'both' | 'planned' | 'actual';
}

// Define point colors outside the component
const POINT_COLORS = {
  planned: '#00aeef',
  actual: '#ff6b6b',
} as const;

const CustomScatterChartComponent: React.FC<ScatterplotChartProps> = ({
  data,
  isPreview = false,
  displayMode = 'both',
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
    let tooltip = d3.select('body').select<HTMLDivElement>('.custom-scatter-tooltip');
    if (tooltip.empty()) {
      tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'custom-scatter-tooltip') // Use consistent class name
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('opacity', '0') // Controlled by D3
        .style('transition', 'opacity 0.15s'); // Smooth transition for opacity
      // z-index will be handled by the CSS class
    }

    /* Suggested SCSS for .custom-scatter-tooltip (to be placed in a relevant .scss file):
    .custom-scatter-tooltip {
      @apply absolute bg-white border border-gray-300 p-4 rounded-2xl shadow-lg text-sm;
      // Or using CSS variables:
      // position: absolute; // Already handled by inline style for D3 positioning
      // background-color: var(--e-grayscale-white);
      // border: 1px solid var(--e-grayscale-300);
      // padding: var(--e-sp-16);
      // border-radius: var(--e-br-24);
      // box-shadow: var(--e-shadow-lg);
      // font-size: var(--e-body-5);
      font-family: var(--e-font-family-rubik);
      // pointer-events: none; // Already handled by inline style
      // opacity: 0; // Controlled by D3 for show/hide
      // transition: opacity 0.15s; // Already handled by inline style
      min-width: 250px;
      max-width: 300px;
      z-index: 50; // Or Tailwind z-50
    }
    */

    // Don't hide at start - we'll control visibility with opacity instead of display

    // Helper function to apply consistent font styling to axis labels
    const applyAxisLabelStyles = (selection: d3.Selection<any, any, any, any>, isXAxis = true) => {
      selection
        .style('font-family', 'Rubik')
        .style('font-size', isPreview ? '12px' : '14px')
        .style('fill', isXAxis ? '#77868F' : '#0F1214');
    };

    // D3 Helper Functions
    // Helper to apply consistent font styling to axis labels
    const applyAxisLabelStyles = (selection: d3.Selection<any, any, any, any>, isXAxis = true) => {
      selection
        .style('font-family', 'Rubik')
        .style('font-size', isPreview ? '12px' : '14px')
        .style('fill', isXAxis ? '#77868F' : '#0F1214');
    };

    // Sets up the X and Y scales
    const setupScales = (width: number, height: number) => {
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

      return { xScale, yScale };
    };

    // Draws the X and Y axes
    const drawAxes = (
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      xScale: d3.ScaleLinear<number, number>,
      yScale: d3.ScaleLinear<number, number>,
      width: number,
      height: number,
      margin: { top: number; right: number; bottom: number; left: number }
    ) => {
      const xAxis = g
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5));
      applyAxisLabelStyles(xAxis.selectAll('text'), true);

      g.append('text')
        .attr('class', 'x-axis-label')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Rubik')
        .style('font-size', isPreview ? '12px' : '14px')
        .style('fill', '#77868F')
        .text('Duration (months)');

      const yAxis = g.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScale).ticks(5));
      applyAxisLabelStyles(yAxis.selectAll('text'), false);

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
      return { xAxis, yAxis };
    };

    // Draws the grid lines
    const drawGrid = (
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      xScale: d3.ScaleLinear<number, number>,
      yScale: d3.ScaleLinear<number, number>,
      width: number,
      height: number
    ) => {
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
    };

    // Main chart update function
    const updateChart = () => {
      d3.select(svgRef.current).selectAll('*').remove();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const baseWidth = containerRect.width;
      const baseHeight = containerRect.height;
      const margin = isPreview
        ? { top: 20, right: 20, bottom: 40, left: 60 }
        : { top: 40, right: 40, bottom: 60, left: 80 };

      const width = Math.max(baseWidth - margin.left - margin.right, 300);
      const height = isPreview
        ? 300 - margin.top - margin.bottom
        : baseHeight - margin.top - margin.bottom;

      const svg = d3
        .select(svgRef.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      const zoomRect = g
        .append('rect')
        .attr('class', 'zoom-rect')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .style('touch-action', 'pan-y pinch-zoom');

      const { xScale, yScale } = setupScales(width, height);

      const clipId = `clip-${Math.random().toString(36).substring(2)}`;
      svg.append('defs').append('clipPath').attr('id', clipId)
        .append('rect').attr('x', 0).attr('y', 0).attr('width', width).attr('height', height);
      const plotArea = g.append('g').attr('clip-path', `url(#${clipId})`);

      drawGrid(g, xScale, yScale, width, height);
      const { xAxis, yAxis } = drawAxes(g, xScale, yScale, width, height, margin);

      const { plannedRegression, actualRegression } = drawRegressionLines(
        plotArea,
        data,
        xScale,
        yScale,
        displayMode
      );
      drawDataPoints(plotArea, data, xScale, yScale, displayMode, isPreview);
      setupTooltipInteraction(plotArea, tooltip, isPreview, data); // Pass full data for tooltip content
      setupZoom(
        zoomRect,
        g,
        plotArea,
        xAxis,
        yAxis,
        xScale,
        yScale,
        width,
        height,
        displayMode,
        plannedRegression,
        actualRegression,
        applyAxisLabelStyles
      );
    };

    // Draws regression lines
    const drawRegressionLines = (
      plotArea: d3.Selection<SVGGElement, unknown, null, undefined>,
      plotData: ScatterplotData[],
      xScale: d3.ScaleLinear<number, number>,
      yScale: d3.ScaleLinear<number, number>,
      currentDisplayMode: 'both' | 'planned' | 'actual'
    ) => {
      const plannedPoints: Point[] = plotData.map((d) => ({ x: d.planned, y: d.gfa }));
      const actualPoints: Point[] = plotData.map((d) => ({ x: d.actual, y: d.gfa }));

      const plannedReg = calculateLinearRegression(plannedPoints);
      const actualReg = calculateLinearRegression(actualPoints);

      const xDomain = xScale.domain();
      const minX = xDomain[0];
      const maxX = xDomain[1];

      if (currentDisplayMode !== 'actual') {
        const plannedLinePoints = [
          { x: minX, y: plannedReg.slope * minX + plannedReg.intercept },
          { x: maxX, y: plannedReg.slope * maxX + plannedReg.intercept },
        ];
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
      }

      if (currentDisplayMode !== 'planned') {
        const actualLinePoints = [
          { x: minX, y: actualReg.slope * minX + actualReg.intercept },
          { x: maxX, y: actualReg.slope * maxX + actualReg.intercept },
        ];
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
      }
      return { plannedRegression: plannedReg, actualRegression: actualReg };
    };

    // Draws data points
    const drawDataPoints = (
      plotArea: d3.Selection<SVGGElement, unknown, null, undefined>,
      plotData: ScatterplotData[],
      xScale: d3.ScaleLinear<number, number>,
      yScale: d3.ScaleLinear<number, number>,
      currentDisplayMode: 'both' | 'planned' | 'actual',
      isChartPreview: boolean
    ) => {
      if (currentDisplayMode !== 'actual') {
        plotArea
          .selectAll('.planned-point')
          .data(plotData)
          .enter()
          .append('circle')
          .attr('class', 'planned-point')
          .attr('cx', (d) => xScale(d.planned))
          .attr('cy', (d) => yScale(d.gfa))
          .attr('r', isChartPreview ? 6 : 8)
          .attr('fill', POINT_COLORS.planned)
          .attr('stroke', 'white')
          .attr('stroke-width', 2);
      }

      if (currentDisplayMode !== 'planned') {
        plotArea
          .selectAll('.actual-point')
          .data(plotData)
          .enter()
          .append('circle')
          .attr('class', 'actual-point')
          .attr('cx', (d) => xScale(d.actual))
          .attr('cy', (d) => yScale(d.gfa))
          .attr('r', isChartPreview ? 6 : 8)
          .attr('fill', POINT_COLORS.actual)
          .attr('stroke', 'white')
          .attr('stroke-width', 2);
      }
    };

    // Sets up tooltip interactions
    const setupTooltipInteraction = (
      plotArea: d3.Selection<SVGGElement, unknown, null, undefined>,
      tooltipInstance: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
      isChartPreview: boolean,
      _plotData: ScatterplotData[] // _plotData is passed for context if needed for tooltip content based on all data
    ) => {
      const pointsSelector = '.planned-point, .actual-point';
      const selection = plotArea.selectAll<SVGCircleElement, ScatterplotData>(pointsSelector);

      selection.on('mouseover', null).on('mousemove', null).on('mouseout', null); // Clear existing

      selection
        .on('mouseover', function (event, d) {
          event.stopPropagation();
          const point = d3.select(this);
          const diff = d.actual - d.planned;
          const percentDiff = ((diff / d.planned) * 100).toFixed(1);
          const durationVariance = Math.abs(diff);
          const efficiencyScore = (d.gfa / d.actual).toFixed(2);
          const plannedEfficiency = (d.gfa / d.planned).toFixed(2);
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

          const tooltipWidth = 250; // Keep these or pass as params if they vary
          const tooltipHeight = 200;
          const { pageX, pageY } = event;
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;
          const showOnLeft = windowWidth - pageX < tooltipWidth + 20;
          const showAbove = windowHeight - pageY < tooltipHeight + 20;

          tooltipInstance
            .style('opacity', '1')
            .style('left', showOnLeft ? `${pageX - tooltipWidth - 10}px` : `${pageX + 10}px`)
            .style('top', showAbove ? `${pageY - tooltipHeight - 10}px` : `${pageY + 10}px`)
            .html(
              `<div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">Project ID - ${d.projectId}</div>` +
                `<div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">Project Name - ${d.projectName}</div>` +
                `<div style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">Project Metrics</div>` +
                `<div style="display: flex; flex-direction: column; gap: 8px;">` +
                `<div style="display: flex; justify-content: space-between;">` +
                `<span style="color: #4b5563;">GFA:</span><span style="font-weight: 500;">${formattedGFA} sqm</span>` +
                `</div>` +
                `<div style="display: flex; justify-content: space-between;">` +
                `<span style="color: #4b5563;">Planned Duration:</span><span style="font-weight: 500;">${formattedPlanned} ${d.metric}</span>` +
                `</div>` +
                `<div style="display: flex; justify-content: space-between;">` +
                `<span style="color: #4b5563;">Actual Duration:</span><span style="font-weight: 500;">${formattedActual} ${d.metric}</span>` +
                `</div>` +
                `<div style="display: flex; justify-content: space-between;">` +
                `<span style="color: #4b5563;">Variance:</span><span style="font-weight: 500; color: ${diff >= 0 ? '#ff6b6b' : '#4caf50'};">` +
                `${diff >= 0 ? '+' : ''}${durationVariance.toFixed(1)} ${d.metric} (${diff >= 0 ? '+' : ''}${percentDiff}%)</span>` +
                `</div>` +
                `<div style="display: flex; justify-content: space-between;">` +
                `<span style="color: #4b5563;">Planned Efficiency:</span><span style="font-weight: 500;">${plannedEfficiency} sqm/day</span>` +
                `</div>` +
                `<div style="display: flex; justify-content: space-between;">` +
                `<span style="color: #4b5563;">Actual Efficiency:</span><span style="font-weight: 500;">${efficiencyScore} sqm/day</span>` +
                `</div></div>`
            );
          point
            .attr('r', isChartPreview ? 9 : 12)
            .attr('stroke-width', 3)
            .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');
        })
        .on('mousemove', function (event) {
          event.stopPropagation();
          const tooltipWidth = 250;
          const tooltipHeight = 200;
          const { pageX, pageY } = event;
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;
          const showOnLeft = windowWidth - pageX < tooltipWidth + 20;
          const showAbove = windowHeight - pageY < tooltipHeight + 20;
          tooltipInstance
            .style('left', showOnLeft ? `${pageX - tooltipWidth - 10}px` : `${pageX + 10}px`)
            .style('top', showAbove ? `${pageY - tooltipHeight - 10}px` : `${pageY + 10}px`);
        })
        .on('mouseout', function (event) {
          event.stopPropagation();
          tooltipInstance.style('opacity', '0');
          d3.select(this)
            .attr('r', isChartPreview ? 6 : 8)
            .attr('stroke-width', 2)
            .style('filter', null);
        });

        // Ensure points are interactive
        plotArea.selectAll(pointsSelector).style('pointer-events', 'visible').style('cursor', 'pointer');
    };

    // Sets up zoom behavior
    const setupZoom = (
      zoomRectElement: d3.Selection<SVGRectElement, unknown, null, undefined>,
      gElement: d3.Selection<SVGGElement, unknown, null, undefined>,
      plotAreaElement: d3.Selection<SVGGElement, unknown, null, undefined>,
      xAxisElement: d3.Selection<SVGGElement, unknown, null, undefined>,
      yAxisElement: d3.Selection<SVGGElement, unknown, null, undefined>,
      xScaleOriginal: d3.ScaleLinear<number, number>,
      yScaleOriginal: d3.ScaleLinear<number, number>,
      chartWidth: number,
      chartHeight: number,
      currentDisplayMode: 'both' | 'planned' | 'actual',
      plannedReg: { slope: number; intercept: number },
      actualReg: { slope: number; intercept: number },
      axisLabelStyler: (selection: d3.Selection<any,any,any,any>, isX: boolean) => void
    ) => {
      const zoomBehavior = d3
        .zoom()
        .scaleExtent([0.2, 8])
        .extent([[0, 0],[chartWidth, chartHeight]])
        .on('zoom', (event) => {
          const { transform } = event;
          const newXScale = transform.rescaleX(xScaleOriginal);
          const newYScale = transform.rescaleY(yScaleOriginal);

          xAxisElement.transition().duration(100).ease(d3.easeLinear)
            .call(d3.axisBottom(newXScale).ticks(5) as any)
            .on('end', () => axisLabelStyler(xAxisElement.selectAll('text'), true));

          yAxisElement.transition().duration(100).ease(d3.easeLinear)
            .call(d3.axisLeft(newYScale).ticks(5) as any)
            .on('end', () => axisLabelStyler(yAxisElement.selectAll('text'), false));

          if (currentDisplayMode !== 'actual') {
            plotAreaElement.selectAll('.planned-point')
              .attr('cx', (d: any) => newXScale(d.planned))
              .attr('cy', (d: any) => newYScale(d.gfa));
          }
          if (currentDisplayMode !== 'planned') {
            plotAreaElement.selectAll('.actual-point')
              .attr('cx', (d: any) => newXScale(d.actual))
              .attr('cy', (d: any) => newYScale(d.gfa));
          }

          const newXDomain = newXScale.domain();
          const minX = newXDomain[0];
          const maxX = newXDomain[1];

          if (currentDisplayMode !== 'actual') {
            const newPlannedLinePoints = [
              { x: minX, y: plannedReg.slope * minX + plannedReg.intercept },
              { x: maxX, y: plannedReg.slope * maxX + plannedReg.intercept },
            ];
            plotAreaElement.select('.regression-line.planned')
              .attr('x1', newXScale(newPlannedLinePoints[0].x))
              .attr('y1', newYScale(newPlannedLinePoints[0].y))
              .attr('x2', newXScale(newPlannedLinePoints[1].x))
              .attr('y2', newYScale(newPlannedLinePoints[1].y));
          }
          if (currentDisplayMode !== 'planned') {
            const newActualLinePoints = [
              { x: minX, y: actualReg.slope * minX + actualReg.intercept },
              { x: maxX, y: actualReg.slope * maxX + actualReg.intercept },
            ];
            plotAreaElement.select('.regression-line.actual')
              .attr('x1', newXScale(newActualLinePoints[0].x))
              .attr('y1', newYScale(newActualLinePoints[0].y))
              .attr('x2', newXScale(newActualLinePoints[1].x))
              .attr('y2', newYScale(newActualLinePoints[1].y));
          }

          gElement.selectAll('.grid line.x-grid').transition().duration(100).ease(d3.easeLinear)
            .attr('x1', (d: any) => newXScale(d)).attr('x2', (d: any) => newXScale(d));
          gElement.selectAll('.grid line.y-grid').transition().duration(100).ease(d3.easeLinear)
            .attr('y1', (d: any) => newYScale(d)).attr('y2', (d: any) => newYScale(d));
        });

      zoomRectElement.call(zoomBehavior as any);
      zoomRectElement.on('dblclick.zoom', () => {
        zoomRectElement.transition().duration(400).ease(d3.easeCubicInOut)
          .call(zoomBehavior.transform as any, d3.zoomIdentity)
          .on('end', () => {
            axisLabelStyler(xAxisElement.selectAll('text'), true);
            axisLabelStyler(yAxisElement.selectAll('text'), false);
          });
      });
    };

    updateChart();

    // Add resize listener with ResizeObserver
    let resizeTimeout: NodeJS.Timeout | null = null;
    const resizeObserver = new ResizeObserver((entries) => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      const entry = entries[0];
      const newWidth = entry.contentRect.width;
      const newHeight = entry.contentRect.height;
      resizeTimeout = setTimeout(() => {
        if (newWidth > 0 && (isPreview || newHeight > 0)) {
          d3.select('.custom-scatter-tooltip').style('opacity', '0'); // Use updated class
          updateChart();
        }
      }, 100);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
      tooltip.style('opacity', '0');
      setTimeout(() => {
        const tooltipElement = document.querySelector('.custom-scatter-tooltip'); // Use updated class
        if (tooltipElement && !document.contains(svgRef.current)) {
          tooltip.style('opacity', '0');
        }
      }, 50);
    };
  }, [data, isPreview, displayMode]);

  // If there's no data, show the NoDataMessage component
  if (!data || data.length === 0) {
    return <NoDataMessage isPreview={isPreview} message="No data available for scatter chart" />;
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex flex-col items-center justify-center relative overflow-visible ${isPreview ? 'min-h-[350px] max-h-[350px]' : 'min-h-full'} flex-1 cursor-default`}
    >
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export const CustomScatterChart = React.memo(CustomScatterChartComponent);
