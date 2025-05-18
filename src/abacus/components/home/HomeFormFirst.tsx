import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useHomeData } from './HomeContext';
import { BaseFormStep } from './components/BaseFormStep';
import { useProjectData } from './hooks/useProjectData';
import { abacusApiClient } from '@/lib/config/axiosConfig';
import InputField from '@/einstein/components/common/inputField/InputField';
import Select from '@/einstein/components/common/select/Select';
import TextArea from '@/einstein/components/common/textArea/TextArea';

// Define fields that are required using specific literal types
const REQUIRED_FIELDS: (
  | 'projectId'
  | 'projectDescription'
  | 'sector'
  | 'subSector'
  | 'sourceOfConstructionCost'
  | 'levelOfEstimate'
)[] = [
  'projectId',
  'projectDescription',
  'sector',
  'subSector',
  'sourceOfConstructionCost',
  'levelOfEstimate',
];

export const HomeFormFirst: React.FC = () => {
  const { state, dispatch } = useHomeData();
  const { data } = state;
  const {
    fetchProjectDetails,
    sectors,
    subSectors,
    constructionCostSources,
    levelOfEstimates,
    procurementModels,
    landTypes,
  } = useProjectData();

  // Error state
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  // State for Project ID suggestions
  const [projectIdSuggestions, setProjectIdSuggestions] = useState<string[]>([]);
  const [isSearchingProjects, setIsSearchingProjects] = useState(false);
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false);
  const projectIdInputRef = useRef<HTMLDivElement>(null); // Ref for the input field wrapper

  // Sort sectors by their numeric prefix
  const sortedSectors = useMemo(() => {
    return [...sectors].sort((a, b) => {
      const numA = parseInt(a.label?.split(' - ')[0] || '0');
      const numB = parseInt(b.label?.split(' - ')[0] || '0');
      return numA - numB;
    });
  }, [sectors]);

  const handleChange = (name: string, value: string | number | boolean) => {
    dispatch({
      type: 'UPDATE_FIRST_STEP',
      payload: { [name]: value },
    });

    // Clear error for this field when changed
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }

    // Reset sub-sector when sector changes
    if (name === 'sector') {
      dispatch({
        type: 'UPDATE_FIRST_STEP',
        payload: { subSector: '' },
      });
    }
  };

  // --- Validation --- You'll need to call this function before proceeding to the next step
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: boolean } = {};
    let isValid = true;

    REQUIRED_FIELDS.forEach((field) => {
      if (!data[field]) {
        // Check if required field is empty
        newErrors[field] = true;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };
  // --- End Validation ---

  // Function to search project IDs (moved from commented out section)
  const searchProjectIds = async (query: string): Promise<string[]> => {
    if (query.length < 2) {
      // Don't search for very short strings
      return [];
    }
    setIsSearchingProjects(true);
    try {
      // Use template literal for URL construction
      const response = await abacusApiClient.get<string[]>(`/projects/${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching project IDs:', error);
      return [];
    } finally {
      setIsSearchingProjects(false);
    }
  };

  // Effect to fetch suggestions when Project ID changes
  // TODO: Add debouncing to this effect
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (data.projectId) {
        const suggestions = await searchProjectIds(data.projectId);
        setProjectIdSuggestions(suggestions);
        setShowProjectSuggestions(suggestions.length > 0);
      } else {
        setProjectIdSuggestions([]);
        setShowProjectSuggestions(false);
      }
    };

    // Simple immediate fetch for now
    fetchSuggestions();
  }, [data.projectId]); // Dependency on projectId

  // Handle selecting a suggestion
  const handleSuggestionSelect = (selectedValue: string) => {
    handleChange('projectId', selectedValue); // Update input field value
    fetchProjectDetails(selectedValue); // Fetch details (should update name etc.)
    setProjectIdSuggestions([]); // Clear suggestions
    setShowProjectSuggestions(false); // Hide dropdown
  };

  // --- Close dropdown on clicks outside ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectIdInputRef.current && !projectIdInputRef.current.contains(event.target as Node)) {
        setShowProjectSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <BaseFormStep title="Project Details" onValidate={validateForm}>
      <div
        className="flex flex-row items-center justify-between mt-6 gap-6"
        ref={projectIdInputRef}
      >
        <div className="relative w-full min-w-[300px] ">
          <InputField
            label="Project ID"
            name="projectId"
            value={data.projectId}
            labelClassName="homeForm__label"
            onChange={(event) => {
              handleChange('projectId', event.target.value);
              // Show suggestions immediately while typing (debouncing is better)
              setShowProjectSuggestions(true);
            }}
            placeholder="TBH Project Code"
            // containerClassName="min-w-[300px]" // Apply width to wrapper
            error={!!errors.projectId}
            autoComplete="off" // Prevent browser autocomplete interference
            onFocus={() => setShowProjectSuggestions(projectIdSuggestions.length > 0)} // Show on focus if suggestions exist
          />
          {/* Suggestions Dropdown */}
          {showProjectSuggestions && projectIdSuggestions.length > 0 && (
            <div className="inputField__suggestions">
              {isSearchingProjects ? (
                <div className="inputField__suggestionItem--loading">Loading...</div>
              ) : (
                projectIdSuggestions.map((suggestion) => (
                  <div
                    key={suggestion}
                    className="inputField__suggestionItem"
                    onClick={() => handleSuggestionSelect(suggestion)}
                    // Use onMouseDown to prevent blur firing before click
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {suggestion}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <InputField
          label="Project Name"
          name="projectName"
          labelClassName="homeForm__label"
          value={data.projectName}
          onChange={() => {}}
          disabled
          placeholder={data.projectId ? `Details for ${data.projectId}` : 'TBH Project Name'}
          containerClassName="w-full"
        />
      </div>

      <div className="mt-6">
        <TextArea
          label="Project Description"
          name="projectDescription"
          value={data.projectDescription}
          labelClassName="homeForm__label"
          onChange={(event) => handleChange('projectDescription', event.target.value)}
          placeholder="High level description to quickly understand relevancy for benchmarking
(e.g. 10 level apartment building + 2 levels basement, 50x2bed, 30x3bed, high level finish, roof top terrace)"
          rows={4}
          error={!!errors.projectDescription}
        />
      </div>

      <div className="homeFormFirst__columnsContainer">
        <div className="flex flex-col gap-7 w-full">
          <Select
            label="ICMS Sectors"
            options={sortedSectors}
            value={data.sector}
            onChange={(selectedValue) => handleChange('sector', selectedValue)}
            placeholder="Select Sector"
            error={!!errors.sector}
          />

          <Select
            label="Sub Sector"
            options={data.sector ? subSectors : []}
            value={data.subSector}
            onChange={(selectedValue) => handleChange('subSector', selectedValue)}
            placeholder={data.sector ? 'Select Sub Sector' : 'Select Sector first'}
            error={!!errors.subSector}
          />

          <Select
            label="Source of Construction Cost"
            options={constructionCostSources}
            value={data.sourceOfConstructionCost}
            onChange={(selectedValue) => handleChange('sourceOfConstructionCost', selectedValue)}
            placeholder="Select Source"
            error={!!errors.sourceOfConstructionCost}
          />

          <Select
            label="Level of Estimate"
            options={levelOfEstimates}
            value={data.levelOfEstimate}
            onChange={(selectedValue) => handleChange('levelOfEstimate', selectedValue)}
            placeholder="Select Level"
            error={!!errors.levelOfEstimate}
          />

          <Select
            label="Procurement Model (optional)"
            options={procurementModels}
            value={data.procurementModel}
            onChange={(selectedValue) => handleChange('procurementModel', selectedValue)}
            placeholder="Select Model"
          />
        </div>

        <div className="flex flex-col gap-7 w-full">
          <InputField
            label="Year of Head Contract (optional)"
            name="yearOfHeadContractNUM"
            type="number"
            value={data.yearOfHeadContractNUM}
            onChange={(event) => handleChange('yearOfHeadContractNUM', event.target.value)}
            placeholder="YYYY"
            labelClassName="homeForm__label"
          />

          <Select
            label="Land Type (optional)"
            options={landTypes}
            value={data.landType}
            onChange={(selectedValue) => handleChange('landType', selectedValue)}
            placeholder="Select Land Type"
          />

          <InputField
            label="Site Area (m²) (optional)"
            name="siteArea"
            type="number"
            value={data.siteArea}
            onChange={(event) => handleChange('siteArea', event.target.value)}
            placeholder="Enter site area"
            labelClassName="homeForm__label"
          />

          <InputField
            label="Internal floor area of the asset (m²) (optional)"
            name="fullyEnclosedCoveredArea"
            type="number"
            value={data.fullyEnclosedCoveredArea}
            onChange={(event) => handleChange('fullyEnclosedCoveredArea', event.target.value)}
            placeholder="Enter internal floor area"
            labelClassName="homeForm__label"
          />

          <InputField
            label="External covered floor area of the asset (m²) (optional)"
            name="unenclosedCoveredArea"
            type="number"
            value={data.unenclosedCoveredArea}
            onChange={(event) => handleChange('unenclosedCoveredArea', event.target.value)}
            placeholder="Enter external covered floor area"
            labelClassName="homeForm__label"
          />
        </div>
      </div>
    </BaseFormStep>
  );
};
