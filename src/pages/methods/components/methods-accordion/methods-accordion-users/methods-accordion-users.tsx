import './methods-accordion-users.scss';
import { useRef, useState } from 'react';
import Overlay from 'react-bootstrap/Overlay';
import type { IMethodCardUser } from '@/pages/methods/methods.models';

export function MethodsAccordionUsers({
  data,
  index,
}: {
  data: IMethodCardUser[] | undefined;
  index: number;
}) {
  const [show, setShow] = useState(false);
  const target = useRef(null);

  return (
    <div
      className="methods-users e-crs-pointer"
      ref={target}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setShow(!show);
      }}
    >
      {(data || [])?.length > 1 && (
        <div className="methods-users-avatar e-br-100">
          <span className="methods-users-avatar__title e-body-5">+{(data?.length || 0) - 1}</span>
        </div>
      )}
      {(data || []).slice(0, 1).map((user, i) => (
        <div className="methods-users-avatar e-br-100" key={i}>
          <span className="methods-users-avatar__title e-body-5">
            {user.firstName?.[0]}
            {user.lastName?.[0]}
          </span>
        </div>
      ))}

      <Overlay
        target={target.current}
        container={target.current}
        show={show}
        rootClose
        onHide={() => setShow(false)}
        placement="left"
      >
        {({
          placement: _placement,
          arrowProps: _arrowProps,
          show: _show,
          popper: _popper,
          hasDoneInitialMeasure: _hasDoneInitialMeasure,
          ...props
        }) => (
          <div
            className="methods-users-tooltip e-pd-16 e-br-8"
            {...props}
            style={{ zIndex: 1000 + index, ...props.style }}
          >
            {(data || []).map((item, i) => (
              <div className="methods-users-tooltip__item" key={i}>
                <div className="methods-users-tooltip__item-avatar methods-users-avatar e-br-100">
                  <span className="methods-users-avatar__title e-body-5">
                    {item.firstName?.[0]}
                    {item.lastName?.[0]}
                  </span>
                </div>
                <p className="methods-users-tooltip__item-title e-body-5 e-500 e-uppercase">
                  {item.firstName} {item.lastName}
                </p>
              </div>
            ))}
          </div>
        )}
      </Overlay>
    </div>
  );
}
