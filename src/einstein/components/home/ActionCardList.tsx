import { useState } from 'react';
import { BookOpen, Lightbulb, MapPin, ChartBar, Flashlight, Brain } from 'lucide-react';
import ActionCard from './ActionCard';
import ClickableActionCard from './ClickableActionCard';
import { featureFlags } from '@/lib/config/featureFlags';
import { useNavigate } from 'react-router-dom';

const ActionCardList = () => {
  const [showAdditionalCards, setShowAdditionalCards] = useState(false);
  const navigate = useNavigate();
  const handleGalileoClick = () => {
    setShowAdditionalCards(true);
  };

  return (
    <div>
      {!showAdditionalCards ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActionCard
            href="/project/chat"
            icon={<Lightbulb className="w-8 h-8 text-titlePrimaryBlue" />}
            header="Curiosity"
            description="Powered Insights & Recommendations For Your Projects & Pitches."
          />
          <ActionCard
            href="/methodologies"
            icon={<BookOpen className="w-8 h-8 text-titlePrimaryBlue" />}
            header="Methods"
            description="Standardised Processes, Templates & Best Practice Examples For Your Projects & Pitches."
          />
          <ActionCard
            href="/map"
            icon={<MapPin className="w-8 h-8 text-titlePrimaryBlue" />}
            header="Maps"
            description="Geospatial Views Of Our Projects And Their Artefacts For Your Pitches."
          />
          <ClickableActionCard
            href="#"
            icon={<ChartBar className="w-8 h-8 text-titlePrimaryBlue" />}
            header="Galileo"
            description="Benchmarks & Analytics For Your Projects & Pitches."
            onClick={handleGalileoClick}
          />
          {featureFlags.isAbacusEnabled && (
            <ClickableActionCard
              href="/abacus-cost"
              icon={<img src="/AbacusLogo2.svg" alt="Abacus" className="w-8 h-8" />}
              header="Abacus-Cost"
              description="Cost Estimate Benchmarking Tool"
              onClick={() => navigate('/abacus-cost')}
            />
          )}
          {featureFlags.isHowToEnabled && (
            <ClickableActionCard
              href="/how-to"
              icon={<ChartBar className="w-8 h-8 text-titlePrimaryBlue" />}
              header="How To"
              description="From inception to close out"
              onClick={() => navigate('/how-to')}
            />
          )}
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[184px]">
            <ActionCard
              href="/galileo/benchmarks"
              icon={<Brain className="w-8 h-8 text-titlePrimaryBlue" />}
              header="Insights"
              description="Evaluate Your Project Against The TBH Baseline."
              className="ml-[38px]"
            />
            <ActionCard
              href="/galileo/benchmarks/micro"
              icon={<Flashlight className="w-8 h-8 text-titlePrimaryBlue" />}
              header="Analytics"
              description="Review Key Metrics For A Specific Project."
              className="ml-[36px]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionCardList;
