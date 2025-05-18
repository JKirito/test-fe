// Import SCSS file
import './SuccessConfirmation.scss';

interface SuccessConfirmationProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onClose?: () => void;
  imageSrc?: string;
}

export default function SuccessConfirmation({
  title = 'Submitted successfully',
  description = 'The project cost calculation has been successfully completed and waiting for the furhter approval. Click "Close" to exit this screen and start a new calculation.',
  buttonText = 'Close',
  onClose = () => {},
  imageSrc,
}: SuccessConfirmationProps) {
  return (
    // Use BEM block class
    <div className="success-confirmation">
      {/* Use BEM element class */}
      <div className="success-confirmation__image-container">
        {imageSrc ? (
          <>
            <img
              src={imageSrc || '/placeholder.svg'} // Keep placeholder logic
              alt="Success"
              width={120}
              height={120}
              // Use BEM element class
              className="success-confirmation__image"
            />
            <div className="success-confirmation__image__badge-circle" />
            <img
              src="/icons/badge-check.svg"
              alt="Badge Check"
              className="success-confirmation__image__badge-check"
            />
          </>
        ) : (
          // Use BEM element class
          <div className="success-confirmation__placeholder">
            <span>Image placeholder</span>
          </div>
        )}
      </div>

      {/* Use BEM element class */}
      <h2 className="success-confirmation__title">{title}</h2>

      {/* Use BEM element class */}
      <p className="success-confirmation__description">{description}</p>

      {/* Use BEM element class */}
      <button
        type="button" // Add explicit type
        onClick={onClose}
        className="success-confirmation__button"
      >
        {buttonText}
      </button>
    </div>
  );
}
