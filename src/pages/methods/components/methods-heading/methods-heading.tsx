import './methods-heading.scss';
import { MockMethodTitles } from '../../methods.mock';

export interface IMethodsHeading {
  depth: number;
  maxDepth: number;
  selectedOptions: any[];
  onEdit: (index: number) => void;
}

export function MethodsHeading({ depth, maxDepth, selectedOptions, onEdit }: IMethodsHeading) {
  return (
    <div className="methods-list__heading e-mg-b-12 e-mg-t-16">
      <h4 className="methods-list__heading-title e-body-1 e-600">{MockMethodTitles[depth]}</h4>
      {selectedOptions?.[depth] && (
        <div className="methods-list__heading-actions">
          {/* <button className="methods-list__heading-actions__complete e-btn e-btn-ghost">
            <img src="/icons/complete.svg" alt="" />
          </button> */}
          {depth !== maxDepth - 1 && (
            <button
              onClick={() => onEdit(depth)}
              className="methods-list__heading-actions__edit e-btn e-btn-ghost"
              style={{
                marginTop: '-4px',
                flexDirection: 'row',
                background: '#149Ef6',
                color: '#fff',
                padding: '4px 8px',
              }}
            >
              <img src="/icons/back.svg" alt="" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
