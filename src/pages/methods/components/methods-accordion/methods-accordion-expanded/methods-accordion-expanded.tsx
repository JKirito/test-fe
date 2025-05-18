import type { IMethodCardLink } from '@/pages/methods/methods.models';
import './methods-accordion-expanded.scss';
import Accordion from 'react-bootstrap/esm/Accordion';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const isFileLink = (url: string) => {
  // console.log('url', url);
  return /^(Y:\\|file:\/\/)/.test(url);
};

// Helper function to copy text
const copyToClipboard = (textToCopy: string) => {
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      toast.success('Copied to clipboard!');
    })
    .catch((error) => {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy');
    });
};

export function MethodsAccordionExpanded({
  data,
  index,
  onClick,
}: {
  data: IMethodCardLink[] | undefined;
  index: number;
  onClick?: () => void;
}) {
  return (
    <Accordion.Collapse
      className="methods-expanded"
      eventKey={String(index)}
      style={{ zIndex: 1000 - index, visibility: 'visible' }}
    >
      <div className="methods-expanded-content">
        {(data || []).map((item, i) => (
          <div className="methods-expanded-content__list mt-2" key={i}>
            <p className="methods-expanded-content__list-title e-body-5 e-500 e-uppercase">
              {item.title}
            </p>
            {(item?.children || []).map((link, i) =>
              isFileLink(link.url) ? (
                <div key={i} className="methods-expanded-content__list-item--file flex ">
                  <p className="methods-expanded-content__list-text text-grayscale-950">
                    {link.title}
                  </p>
                  <button
                    className="methods-expanded-content__copy-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(link.url);
                    }}
                    title={`Copy path: ${link.url}`}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              ) : (
                <a
                  className="methods-expanded-content__list-item"
                  onClick={onClick}
                  href={link.url}
                  key={i}
                  rel="noreferrer"
                >
                  {link.title}
                </a>
              )
            )}
          </div>
        ))}
      </div>
    </Accordion.Collapse>
  );
}
