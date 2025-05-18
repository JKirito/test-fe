import Accordion from 'react-bootstrap/esm/Accordion';
import type { IMethodCard } from '../../methods.models';
import { MethodsCard } from '../methods-card/methods-card';
import { MethodsHeading } from '../methods-heading/methods-heading';

export const MethodsRecursive = (
  item: IMethodCard,
  path: any[],
  maxDepth: number,
  onSelect: (data: IMethodCard, path: any[], currentDepth: number) => void,
  currentDepth: number,
  selectedOptions: { data: IMethodCard; path: string; editing: boolean }[],
  onEdit: (index: number) => void
) => {
  const isLastLevel = currentDepth === maxDepth;
  const cIndex = isLastLevel ? path[path.length - 1] : null;
  const pathString = path.join('-');
  const isParentSelected = selectedOptions.some((option) => option.path.startsWith(pathString));

  return (
    <div
      key={path.join('-')}
      style={{
        zIndex: 1000 - (path?.[path?.length - 1] || 0),
      }}
      className={`methods-list__container-item methods-list__container-item--${selectedOptions?.[currentDepth - 1] && currentDepth !== maxDepth ? 'selected' : ''}`}
    >
      {(currentDepth === maxDepth ? true : currentDepth === selectedOptions.length + 1) && (
        <MethodsCard
          data={item}
          pIndex={currentDepth}
          cIndex={cIndex}
          onClick={() => onSelect(item, path, currentDepth)}
        />
      )}

      {(currentDepth === maxDepth ? false : isParentSelected) && (
        <MethodsCard
          data={item}
          pIndex={currentDepth}
          cIndex={cIndex}
          onClick={() => onSelect(item, path, currentDepth)}
        />
      )}

      {item.children && item.children.length > 0 && isParentSelected && (
        <div style={{ width: '100%' }}>
          <MethodsHeading
            maxDepth={maxDepth}
            depth={currentDepth}
            selectedOptions={selectedOptions}
            onEdit={() => onEdit(currentDepth)}
          />
          <Accordion
            className={`methods-list__container-item--${selectedOptions?.[currentDepth - 1] && currentDepth !== maxDepth ? 'selected' : ''}`}
            alwaysOpen={true}
            defaultActiveKey={null}
            style={{ width: '100%' }} // Ensure accordion takes full width
          >
            {item.children.map((subService, sIndex) =>
              MethodsRecursive(
                subService,
                [...path, sIndex],
                maxDepth,
                onSelect,
                currentDepth + 1,
                selectedOptions,
                onEdit
              )
            )}
          </Accordion>
        </div>
      )}
    </div>
  );
};
