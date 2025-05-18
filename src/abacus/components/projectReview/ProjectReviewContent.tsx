import { useState } from 'react';
import SearchFilter from '../common/SearchFilter';
import TextData from '../common/TextData';
import RenderProjectReviewTable from './RenderProjectReviewTable';
import { mockData } from './mockData';
const RenderInput = ({
  projectId,
  setProjectId,
}: {
  projectId: string;
  setProjectId: (id: string) => void;
}) => {
  return (
    <div className="mt-12 flex flex-row items-center justify-between gap-6">
      <div className="flex flex-row items-center justify-start gap-2">
        <SearchFilter
          onSearch={async (text) => {
            // console.log(text);
            return [];
          }}
          onSelect={(item) => {
            // console.log(item);
            setProjectId(item);
          }}
          placeholder="Project ID (From AX)"
          inputClassName="min-w-[300px]"
        />
      </div>
      <div className="w-full">
        <TextData data={`Project Name (Picked up from AX DB) ${projectId}`} />
      </div>
    </div>
  );
};

const ProjectReviewContent = () => {
  const [projectId, setProjectId] = useState('');
  return (
    <div className="px-8 mt-12">
      <div>
        <RenderInput projectId={projectId} setProjectId={setProjectId} />
      </div>
      <div className="mt-12">
        <RenderProjectReviewTable data={mockData} onExcludeChange={() => {}} />
      </div>
    </div>
  );
};

export default ProjectReviewContent;
