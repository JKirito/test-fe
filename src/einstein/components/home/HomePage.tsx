import ActionCardList from './ActionCardList';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import ComposedLogo from '../common/ComposedImage';

const HomePage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const userName = user?.name || '';

  const getFirstName = (name: string) => {
    return name.split(' ')[0];
  };

  return (
    <div className="flex h-full w-full mx-auto flex-col bg-white px-8 min-w-[1000px]">
      <div className="h-[600px] my-auto min-h-[800px]">
        <div className="w-full text-center mt-8">
          <h1 className="text-4xl text-titlePrimaryBlue font-medium capitalize">
            {userName
              ? `Welcome ${getFirstName(userName)}, what would you like to do today?`
              : 'What would you like to do today?'}
          </h1>
        </div>
        <div className="flex flex-row mt-8 min-h-[600px] max-w-[1400px] mx-auto">
          <div className="w-1/3 flex  items-center min-h-[400px]">
            <ComposedLogo logoUrl="/einstein-logo.png" />
          </div>
          <div className="w-2/3 flex justify-center items-center min-h-[400px] ">
            <ActionCardList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
