import { MethodsProgress } from '../methods-progress/methods-progress';

interface MethodsHeaderProps {
  firstName: string;
  maxDepth: number;
  currentProgress: number;
}

export const MethodsHeader = ({ firstName, maxDepth, currentProgress }: MethodsHeaderProps) => {
  return (
    <div className="page-heading">
      <div className="page-heading__container">
        <img
          className="page-heading__container-icon e-heading-title"
          src="/icons/methods.svg"
          alt=""
        />
        <div className="page-heading__container-title e-heading-title">
          <h1 className="e-heading-5 e-600 e-no-selection">
            Let's Get Started,{' '}
            <span className="e-heading-5 e-600 e-brand-title e-accent-title">
              {firstName || 'User'}
            </span>
            {/* <span className="e-heading-5 e-600 e-accent-title"> 📑</span> */}
          </h1>
          <p className="e-body-4 e-left e-no-selection">Select From The Options Below</p>
        </div>
      </div>

      <MethodsProgress progressCount={maxDepth} currentProgress={currentProgress} />
    </div>
  );
};
