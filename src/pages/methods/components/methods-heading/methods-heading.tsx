import './methods-heading.css';
import { MockMethodTitles } from '../../methods.mock';

export interface IMethodsHeading {
  depth: number;
  maxDepth: number;
  selectedOptions: any[];
  onEdit: (index: number) => void;
}

export function MethodsHeading({ depth, maxDepth, selectedOptions, onEdit }: IMethodsHeading) {
  return (
    <div className="methods-list__heading">
      <h4 className="methods-list__heading-title text-[20px] font-semibold">{MockMethodTitles[depth]}</h4>
      {selectedOptions?.[depth] && (
        <div className="methods-list__heading-actions">
          {/* <button className="methods-list__heading-actions__complete e-btn e-btn-ghost">
            <img src="/icons/complete.svg" alt="" />
          </button> */}
          {depth !== maxDepth - 1 && (
            <button
              onClick={() => onEdit(depth)}
              className="methods-list__heading-actions__edit e-btn e-btn-ghost mt-[-4px] flex-row bg-primary-500 text-white px-2 py-1"
            >
              <img src="/icons/back.svg" alt="" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
