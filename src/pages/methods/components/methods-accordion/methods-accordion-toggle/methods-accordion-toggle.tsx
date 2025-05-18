import { useContext } from 'react';
import './methods-accordion-toggle.scss';
import { useAccordionButton } from 'react-bootstrap/esm/AccordionButton';
import AccordionContext from 'react-bootstrap/esm/AccordionContext';

export function MethodsAccordionToggle({ _, eventKey, callback }: any) {
  const { activeEventKey } = useContext(AccordionContext);
  const isOpen = activeEventKey?.includes(String(eventKey));

  const toggleAccordion = useAccordionButton(String(eventKey), () => callback && callback(!isOpen));

  return (
    <button
      type="button"
      className={`methods-toggle methods-toggle--${isOpen ? 'rotated' : ''} e-btn e-btn-ghost`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleAccordion(event);
      }}
      style={{ zIndex: 1000 + eventKey + 2 }}
    >
      <img src="/icons/files.svg" alt="" />
      {/* <File /> */}
    </button>
  );
}
