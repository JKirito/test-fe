import React, { useMemo } from 'react';
import { useBenchmarkData } from '../hooks/useBenchmarkData';
import { useBenchmarkFilters } from '../hooks/useBenchmarkFilters';
import InputField from '@/einstein/components/common/inputField/InputField';
import Select, { SelectOption } from '@/einstein/components/common/select/Select';
import BenchmarkFiltersActions from './BenchmarkFiltersActions';

const BenchmarkFilters: React.FC = () => {
  const {
    sectors,
    subSectors,
    constructionCostSources,
    classEstimates,
    sectorQuestions,
    subSectorQuestions,
  } = useBenchmarkData();

  // Sort sectors by their numeric prefix
  const sortedSectors = useMemo(() => {
    return [...sectors].sort((a, b) => {
      // Extract the numeric prefix from each sector (e.g., "1 - Title" -> 1)
      const numA = parseInt(a.value?.split(' - ')[0] || '0');
      const numB = parseInt(b.value?.split(' - ')[0] || '0');
      return numA - numB;
    });
  }, [sectors]);

  const { filters, setFilter, setSectorAnswer, setSubSectorAnswer, generateResults, isLoading } =
    useBenchmarkFilters();

  // Handle input change for location and year
  const handleInputChange = (field: string, value: string) => {
    setFilter(field as any, value);
  };

  // Handle sector specific question change
  const handleSectorQuestionChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSectorAnswer(index, event.target.value);
  };

  // Handle subsector specific question change
  const handleSubSectorQuestionChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSubSectorAnswer(index, event.target.value);
  };

  return (
    <div className="benchmarkFilters">
      {/* Main Filters Section */}
      <div className="benchmarkFilters__section">
        <h2 className="benchmarkFilters__sectionTitle-header">Project Information</h2>
        {/* Filter Layout */}
        <div className="benchmarkFilters__filterLayout">
          {/* Row 1: Sector & Sub Sector */}
          <div className="benchmarkFilters__filterRow">
            <div className="benchmarkFilters__filterItem">
              <Select
                label="ICMS Sectors"
                options={sortedSectors as SelectOption[]}
                value={filters.sector}
                onChange={(selectedValue) => setFilter('sector', selectedValue)}
                placeholder="Select Sector"
              />
            </div>
            <div className="benchmarkFilters__filterItem">
              <Select
                label="Sub Sector"
                options={
                  filters.sector
                    ? (subSectors as SelectOption[]).map((opt) => ({
                        label: opt.label,
                        value: opt.value,
                      }))
                    : []
                }
                value={filters.subSector}
                onChange={(selectedValue) => setFilter('subSector', selectedValue)}
                placeholder={filters.sector ? 'Select Sub Sector' : 'Select Sector first'}
              />
            </div>
          </div>
          {/* Row 2: Location & Earliest Year */}
          <div className="benchmarkFilters__filterRow">
            <div className="benchmarkFilters__filterItem">
              <InputField
                label="Location"
                name="location"
                value={filters.location}
                onChange={(event) => handleInputChange('location', event.target.value)}
                placeholder="Enter location"
                labelClassName="filter__label"
              />
            </div>
            <div className="benchmarkFilters__filterItem">
              <InputField
                label="Earliest Year"
                name="earliestYear"
                type="text"
                value={filters.earliestYear}
                onChange={(event) => handleInputChange('earliestYear', event.target.value)}
                placeholder="YYYY"
                labelClassName="filter__label"
              />
            </div>
          </div>
          {/* Row 3: Source & Class Estimate */}
          <div className="benchmarkFilters__filterRow">
            <div className="benchmarkFilters__filterItem">
              <Select
                label="Source of Construction Cost"
                options={constructionCostSources.map((opt) => ({
                  label: opt.label,
                  value: opt.value,
                }))}
                value={filters.sourceOfConstructionCost}
                onChange={(selectedValue) => setFilter('sourceOfConstructionCost', selectedValue)}
                placeholder="Select Source"
              />
            </div>
            <div className="benchmarkFilters__filterItem">
              <Select
                label="Class Estimate"
                options={classEstimates.map((opt) => ({ label: opt.label, value: opt.value }))}
                value={filters.classEstimate}
                onChange={(selectedValue) => setFilter('classEstimate', selectedValue)}
                placeholder="Select Class Estimate"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sector Questions Section */}
      {sectorQuestions.length > 0 && (
        <>
          <div className="benchmarkFilters__sectionSeparator"></div>
          <div className="benchmarkFilters__section">
            <h2 className="benchmarkFilters__sectionTitle">Sector Specific Questions</h2>
            <div className="benchmarkFilters__questionGrid">
              {Array.from({ length: Math.ceil(sectorQuestions.length / 2) }).map((_, rowIndex) => (
                <React.Fragment key={`sector-row-${rowIndex}`}>
                  <div className="benchmarkFilters__questionItem">
                    {sectorQuestions[rowIndex * 2] && (
                      <InputField
                        key={`sector-${sectorQuestions[rowIndex * 2].id}`}
                        name={`sector-question-${sectorQuestions[rowIndex * 2].id}`}
                        label={sectorQuestions[rowIndex * 2].question}
                        value={filters.sectorSpecificAnswers[rowIndex * 2]?.answer || ''}
                        onChange={(event) => handleSectorQuestionChange(rowIndex * 2, event)}
                        placeholder="Enter your answer"
                        labelClassName="filter__label"
                      />
                    )}
                  </div>
                  <div className="benchmarkFilters__questionItem">
                    {sectorQuestions[rowIndex * 2 + 1] && (
                      <InputField
                        key={`sector-${sectorQuestions[rowIndex * 2 + 1].id}`}
                        name={`sector-question-${sectorQuestions[rowIndex * 2 + 1].id}`}
                        label={sectorQuestions[rowIndex * 2 + 1].question}
                        value={filters.sectorSpecificAnswers[rowIndex * 2 + 1]?.answer || ''}
                        onChange={(event) => handleSectorQuestionChange(rowIndex * 2 + 1, event)}
                        placeholder="Enter your answer"
                        labelClassName="filter__label"
                      />
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Sub-Sector Questions Section */}
      {subSectorQuestions.length > 0 && (
        <>
          <div className="benchmarkFilters__sectionSeparator"></div>
          <div className="benchmarkFilters__section">
            <h2 className="benchmarkFilters__sectionTitle">Sub-Sector Specific Questions</h2>
            <div className="benchmarkFilters__questionGrid">
              {Array.from({ length: Math.ceil(subSectorQuestions.length / 2) }).map(
                (_, rowIndex) => (
                  <React.Fragment key={`subsector-row-${rowIndex}`}>
                    <div className="benchmarkFilters__questionItem">
                      {subSectorQuestions[rowIndex * 2] && (
                        <InputField
                          key={`subsector-${subSectorQuestions[rowIndex * 2].id}`}
                          name={`subsector-question-${subSectorQuestions[rowIndex * 2].id}`}
                          label={subSectorQuestions[rowIndex * 2].question}
                          value={filters.subSectorSpecificAnswers[rowIndex * 2]?.answer || ''}
                          onChange={(event) => handleSubSectorQuestionChange(rowIndex * 2, event)}
                          placeholder="Enter your answer"
                          labelClassName="filter__label"
                        />
                      )}
                    </div>
                    <div className="benchmarkFilters__questionItem">
                      {subSectorQuestions[rowIndex * 2 + 1] && (
                        <InputField
                          key={`subsector-${subSectorQuestions[rowIndex * 2 + 1].id}`}
                          name={`subsector-question-${subSectorQuestions[rowIndex * 2 + 1].id}`}
                          label={subSectorQuestions[rowIndex * 2 + 1].question}
                          value={filters.subSectorSpecificAnswers[rowIndex * 2 + 1]?.answer || ''}
                          onChange={(event) =>
                            handleSubSectorQuestionChange(rowIndex * 2 + 1, event)
                          }
                          placeholder="Enter your answer"
                          labelClassName="filter__label"
                        />
                      )}
                    </div>
                  </React.Fragment>
                )
              )}
            </div>
          </div>
        </>
      )}

      {/* Actions Container with Exit and Generate Results buttons */}
      <BenchmarkFiltersActions isLoading={isLoading} onGenerate={generateResults} />
    </div>
  );
};

export default BenchmarkFilters;
