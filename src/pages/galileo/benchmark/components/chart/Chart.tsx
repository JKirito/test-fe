import ChartLayout from './ChartLayout';
import ChartHeader from './ChartHeader';
import ChartToolbar from './ChartToolbar';
import { ToggleFullscreen } from '@/components/toggle-fullscreen';

const Chart = () => {
  return (
    <div className="max-w-[450px] max-h-[420px] w-full h-full">
      <ToggleFullscreen>
        <ChartLayout
          header={
            <ChartHeader
              title="As-Planned Vs As-Built Project Duration By Cost"
              description="Distribution of projects across sectors"
            />
          }
          toolbar={<ChartToolbar tools={<div>Tools</div>} cta={<div>CTA</div>} />}
          chart={<div>Chart</div>}
          legend={<div>Legend</div>}
        />
      </ToggleFullscreen>
    </div>
  );
};

export default Chart;
