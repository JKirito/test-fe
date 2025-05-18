'use client';

import React, { useEffect, useState, memo } from 'react';
import type { PinData, ActivePinData, ProjectDetails } from '../types';
import { ProjectInfo } from '../ProjectInfo';
import { useMapDataContext } from '../../context/MapDataContext';
import DraggableOverlay from '../../../common/DraggableOverlay';

import './ActivePinOverlay.scss';

// Use the SCSS class for styling
const CloseButton = ({ onClose }: { onClose: () => void }) => (
  <button onClick={onClose} className="active-pin-overlay__close-button" title="Close">
    &#x2715;
  </button>
);

interface ActivePinOverlayProps {
  selectedPin: ActivePinData;
  onClose: (pin: PinData) => void;
  onHighlightReset: (pin: PinData) => void;
}

const ActivePinOverlay: React.FC<ActivePinOverlayProps> = memo(
  ({ selectedPin, onClose, onHighlightReset }) => {
    const [isBlinking, setIsBlinking] = useState(false);
    const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(
      selectedPin.details || null
    );
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const { fetchProjectDetails } = useMapDataContext();

    useEffect(() => {
      if (selectedPin.isHighlighted) {
        setIsBlinking(true);
        const timer = setTimeout(() => {
          setIsBlinking(false);
          onHighlightReset(selectedPin);
        }, 300);
        return () => clearTimeout(timer);
      }
    }, [selectedPin.isHighlighted, selectedPin, onHighlightReset]);

    useEffect(() => {
      const getProjectDetails = async () => {
        if (!selectedPin.details && selectedPin.projectId) {
          setIsLoadingDetails(true);
          // console.log('Fetching details for pin with projectId:', selectedPin.projectId);

          try {
            let projectIdToFetch = selectedPin.projectId;

            if (projectIdToFetch.startsWith('P_')) {
              projectIdToFetch = projectIdToFetch.substring(2);
              // console.log('Adjusted projectId for API call:', projectIdToFetch);
            }

            const details = await fetchProjectDetails(projectIdToFetch);
            // console.log('API returned project details:', details);

            if (details) {
              setProjectDetails(details);
              // console.log('Project details set in state');
            } else {
              console.error(
                'Failed to get details, API returned null for project ID:',
                projectIdToFetch
              );

              if (projectIdToFetch !== selectedPin.projectId) {
                // console.log('Retrying with original projectId:', selectedPin.projectId);
                const originalIdDetails = await fetchProjectDetails(selectedPin.projectId);
                if (originalIdDetails) {
                  setProjectDetails(originalIdDetails);
                  // console.log('Project details set using original projectId');
                } else {
                  console.error('Both projectId formats failed to fetch details');
                }
              }
            }
          } catch (error) {
            console.error('Error fetching project details:', error);
          } finally {
            setIsLoadingDetails(false);
          }
        } else if (selectedPin.details) {
          // console.log('Pin already has details:', selectedPin.details);
          setProjectDetails(selectedPin.details);
        } else {
          console.error('No projectId available to fetch details');
        }
      };

      getProjectDetails();
    }, [selectedPin.projectId, selectedPin.details, fetchProjectDetails]);

    return (
      <DraggableOverlay
        initialPosition={selectedPin.initialPosition}
        dragHandleSelector=".active-pin-overlay__header"
        className={`active-pin-overlay ${isBlinking ? 'active-pin-overlay--blinking' : ''}`}
      >
        <div className="active-pin-overlay__content">
          <div className="active-pin-overlay__header">
            <h2 className="active-pin-overlay__title">
              {projectDetails?.projectName ||
                selectedPin.projectName ||
                selectedPin.projectname ||
                'Project Details'}
            </h2>
            <CloseButton onClose={() => onClose(selectedPin)} />
          </div>
          <div className="active-pin-overlay__details">
            <ProjectInfo
              project={selectedPin}
              details={projectDetails}
              isLoading={isLoadingDetails}
            />
            <hr className="active-pin-overlay__hr" />
            <button className="active-pin-overlay__artefacts-button">View Project Artefacts</button>
          </div>
        </div>
      </DraggableOverlay>
    );
  }
);

export default ActivePinOverlay;
