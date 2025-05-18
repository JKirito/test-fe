export const featureFlags = {
  isAbacusEnabled: process.env.REACT_APP_IS_ABACUS_ENABLED === 'true',
  isAuthEnabled: process.env.REACT_APP_ENABLE_AUTH === 'true',
  isHowToEnabled: process.env.REACT_APP_IS_HOW_TO_ENABLED === 'true',
};
