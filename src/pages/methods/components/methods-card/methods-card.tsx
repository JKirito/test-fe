import './methods-card.scss';
import Accordion from 'react-bootstrap/esm/Accordion';
import { MethodsAccordionToggle } from '../methods-accordion/methods-accordion-toggle/methods-accordion-toggle';
import { useState } from 'react';
import { MethodsAccordionExpanded } from '../methods-accordion/methods-accordion-expanded/methods-accordion-expanded';
import { MethodsAccordionUsers } from '../methods-accordion/methods-accordion-users/methods-accordion-users';
import type { IMethodCard, IMethodCardLink, IMethodCardUser } from '../../methods.models';

interface IMethodsCardProps {
  data: IMethodCard | undefined;
  pIndex: number;
  cIndex: number;
  active?: boolean;
  size?: 'sm' | 'md';
  onClick?: (data: IMethodCard, pIndex: number, cIndex: number, isContentClick?: boolean) => void;
}

export function MethodsCard({
  data,
  pIndex,
  cIndex,
  active = false,
  size = 'md',
  onClick,
}: IMethodsCardProps) {
  const [opened, isOpen] = useState<boolean>(false);
  const toggleCallback = (event: boolean) => isOpen(event);

  const handleClick = (isContentClick = false) => {
    if (!onClick) return;
    onClick(data!, pIndex, cIndex, isContentClick);
  };

  const getLinks = (): IMethodCardLink[] => data?.links || [];
  const getUsers = (): IMethodCardUser[] => data?.users || [];

  // Determine if we should show the toggle arrow
  const hasLinks = getLinks().length > 0;
  // Determine if this is a number-only card (method level with no files)
  const isNumberOnly = data?.numberOnly === true;
  // For number-only cards, we need the overlay for the step number, but no toggle
  const showOverlay = data?.showIndex || hasLinks;

  return (
    <Accordion className="methods-card e-br-16 e-crs-pointer" defaultActiveKey={null}>
      <div
        tabIndex={cIndex}
        onClick={() => handleClick()}
        className={`methods-card-container methods-card-container--${size} methods-card-container--${active && !opened ? 'active' : ''} e-pd-l-${data?.showIndex ? '56' : '24'} e-500 e-br-16`}
        style={{ zIndex: 1000 - cIndex + 1 }}
      >
        {showOverlay && (
          <div
            className={`methods-card-container__overlay methods-card-container__overlay--${size} methods-card-container__overlay--${opened ? 'active' : ''} methods-card-container__overlay--${!data?.showIndex ? 'supressed' : ''} e-br-16`}
          >
            {data?.showIndex && <span className="e-body-1 e-600">{data.order || cIndex + 1}</span>}
          </div>
        )}

        <div className="methods-card-content">
          <div className="methods-card-text">
            <p className="e-body-4 e-500">{data?.title}</p>
          </div>

          <div className="methods-card-actions">
            {!!getUsers().length && <MethodsAccordionUsers data={getUsers()} index={cIndex} />}

            {/* Only show toggle arrow if there are actual links and not a number-only card */}
            {hasLinks && !isNumberOnly && (
              <MethodsAccordionToggle callback={toggleCallback} eventKey={String(cIndex)} />
            )}
          </div>
        </div>
      </div>

      {hasLinks && !isNumberOnly && (
        <MethodsAccordionExpanded
          data={getLinks()}
          index={cIndex}
          onClick={() => handleClick(true)}
        />
      )}
    </Accordion>
  );
}
