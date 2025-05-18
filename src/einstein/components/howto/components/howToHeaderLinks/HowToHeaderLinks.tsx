import React from 'react';
// Import SCSS for side-effects (applies styles globally/scoped)
import './HowToHeaderLinks.scss';

/**
 * HeaderLinks component for the How To page displaying navigation links
 */
const HowToHeaderLinks: React.FC = () => {
  return (
    // Use the BEM block class
    <div className="how-to-header-links">
      <div className="how-to-header-links__title-container">
        <p
          // Use the BEM element class
          className="how-to-header-links__title"
          onClick={() => {
            // // console.log('Technical Training');
          }}
        >
          Transmission Training
        </p>
      </div>
      <div className="how-to-header-links__links-container">
        <div
          className="how-to-header-links__link-container"
          onClick={() => {
            window.open(
              'https://tbh365-my.sharepoint.com/personal/ali_nami_tbhint_com/_layouts/15/stream.aspx?id=%2Fpersonal%2Fali%5Fnami%5Ftbhint%5Fcom%2FDocuments%2FRecordings%2FElevate%20your%20learning%5F%20Renewables%20Projects%20%2D%20%20Transmission%20Lines%20%28Session%201%29%2D20230727%5F160653%2DMeeting%20Recording%2Emp4&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0&ga=1&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E347e8e61%2Df0e2%2D4a8c%2Da7f1%2D2e4f035ccd00',
              '_blank'
            );
          }}
        >
          <p
            // Use the BEM element class
            className="how-to-header-links__link"
          >
            Transmission Line Construction - The Basics
          </p>
        </div>
        <div
          className="how-to-header-links__link-container"
          onClick={() => {
            window.open(
              'https://tbh365-my.sharepoint.com/personal/marlene_pijlman_tbhint_com/_layouts/15/stream.aspx?id=%2Fpersonal%2Fmarlene%5Fpijlman%5Ftbhint%5Fcom%2FDocuments%2FRecordings%2FElevate%20your%20learning%5F%20Renewables%20Projects%20%2D%20%20Transmission%20Lines%20%28Session%202%29%2D20230803%5F150433%2DMeeting%20Recording%2Emp4&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0&ga=1&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2Ebd431e2e%2D7fc4%2D4d02%2Da7c3%2D294788aa9477',
              '_blank'
            );
          }}
        >
          <p
            // Use the BEM element class
            className="how-to-header-links__link"
          >
            Renewables Projects - Transmission Lines (Session 2)
          </p>
        </div>
        <div
          className="how-to-header-links__link-container"
          onClick={() => {
            window.open(
              'https://tbh365-my.sharepoint.com/personal/marlene_pijlman_tbhint_com/_layouts/15/stream.aspx?id=%2Fpersonal%2Fmarlene%5Fpijlman%5Ftbhint%5Fcom%2FDocuments%2FRecordings%2FElevate%20your%20learning%5F%20Renewables%20Projects%20%E2%80%93%20CEMP%2C%20Property%20Acquisition%20%26%20Biodiversity%20Offsets%2E%2D20231207%5F160604%2DMeeting%20Recording%2Emp4&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0&ga=1&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2Eb5007191%2D8cc0%2D451a%2D925f%2D3e122e708658',
              '_blank'
            );
          }}
        >
          <p
            // Use the BEM element class
            className="how-to-header-links__link"
          >
            Renewables Projects – CEMP, Property Acquisition & Biodiversity Offsets Training
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowToHeaderLinks;
