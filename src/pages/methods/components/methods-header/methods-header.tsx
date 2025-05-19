import { MethodsProgress } from '../methods-progress/methods-progress';

interface MethodsHeaderProps {
  firstName: string;
  maxDepth: number;
  currentProgress: number;
}

export const MethodsHeader = ({ firstName, maxDepth, currentProgress }: MethodsHeaderProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-6">
      <div className="flex flex-wrap items-center gap-6">
        <img
          className="w-14 h-14 object-cover e-heading-title"
          src="/icons/methods.svg"
          alt=""
        />
        <div className="flex flex-col gap-2 e-heading-title">
          <h1 className="text-[28px] font-semibold select-none">
            Let's Get Started,{' '}
            <span className="text-[28px] font-semibold text-primary-500 e-accent-title">
              {firstName || 'User'}
            </span>
          </h1>
          <p className="text-[14px] select-none">Select From The Options Below</p>
        </div>
      </div>

      <MethodsProgress progressCount={maxDepth} currentProgress={currentProgress} />
    </div>
  );
};
