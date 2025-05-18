import React, { memo } from 'react';
import { PinData } from '../types'; // Assuming PinData is in types.ts
import { getGroupColor } from '../../utils/colors'; // Assuming getGroupColor is in utils
import DraggableOverlay from '../../../common/DraggableOverlay'; // Corrected import path
import './ClusterOverlay.scss';

// Helper function to get the display name for a pin (Copied from Map.tsx)
// Consider moving this to a shared util if used elsewhere
const getDisplayName = (pin: PinData) => {
  return pin.projectname || pin.projectName || `Project ${pin.projectId}`;
};

interface ClusterOverlayProps {
  cluster: { pins: PinData[]; industry?: string };
  position: { x: number; y: number }; // This is now the initial position
  onClose: () => void;
  onSelectPin: (pin: PinData) => void;
}

// Wrap component definition with React.memo
const ClusterOverlay: React.FC<ClusterOverlayProps> = memo(
  ({
    cluster,
    position, // Received as initialPosition
    onClose,
    onSelectPin,
  }) => {
    // Removed all state and refs related to dragging (currentPosition, isDragging, wasDragged, dragOffset, overlayRef)
    // Removed all effects and callbacks related to dragging (useEffect for position, handleMouseDown, handleMouseMove, handleMouseUp, useEffect for listeners)

    return (
      // Use DraggableOverlay as the wrapper
      <DraggableOverlay
        initialPosition={position}
        dragHandleSelector=".map-cluster-container" // Specify the header as the drag handle
        className="cluster-overlay" // Pass the base SCSS class
        // No dynamic dragging/was-dragged classes needed here as DraggableOverlay handles movement
      >
        {/* Header: Added explicit cursor style as it's no longer on the main div */}
        <div className="map-cluster-container" style={{ cursor: 'grab' }}>
          <p className="cluster-title">{cluster.pins.length} Projects in this Location</p>
          <button onClick={onClose} className="close-button">
            <img src="/icons/close.svg" alt="close" />
          </button>
        </div>
        <div className="cluster-overlay__body">
          {cluster.pins.map((pin) => (
            <div
              key={pin.projectId}
              className="cluster-overlay__pin-item"
              onClick={() => onSelectPin(pin)}
            >
              <div
                className="cluster-overlay__pin-dot"
                style={{ backgroundColor: getGroupColor(pin.industry || 'default') }}
              />
              <div className="cluster-overlay__pin-info">
                <p className="cluster-overlay__pin-name">{getDisplayName(pin)}</p>
                <div className="cluster-overlay__pin-details">
                  {pin.projectdirector && (
                    <p className="cluster-overlay__pin-detail">
                      <span className="cluster-overlay__pin-detail-label">Director:</span>
                      {pin.projectdirector}
                    </p>
                  )}
                  {pin.industry && (
                    <p className="cluster-overlay__pin-detail">
                      <span className="cluster-overlay__pin-detail-label">Sector:</span>
                      {pin.industry}
                    </p>
                  )}
                </div>
              </div>
              <div className="cluster-overlay__pin-id">ID: {pin.projectId}</div>
            </div>
          ))}
        </div>
      </DraggableOverlay>
    );
  }
); // Close the memo HOC

export default ClusterOverlay;
