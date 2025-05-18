import './background.scss';

export function Background() {
  return (
    <div className="background">
      <svg className="background-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <div className="background-container">
        <div className="background-container__blob-1"></div>
        <div className="background-container__blob-2"></div>
        <div className="background-container__blob-3"></div>
        <div className="background-container__blob-4"></div>
        <div className="background-container__blob-4"></div>
        <div className="background-container__interactive"></div>
      </div>
    </div>
  );
}
