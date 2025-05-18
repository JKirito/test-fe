import { useNavigate } from 'react-router';
import './sign-in-form.scss';
import { initializeAuth } from '@/lib/store/features/auth/authSlice';
import { useAppDispatch } from '@/lib/store/store';
import { useMsal } from '@azure/msal-react';

export function SignInForm() {
  const navigate = useNavigate();

  const { instance } = useMsal();
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    try {
      const response = await instance.loginPopup();
      instance.setActiveAccount(response.account);
      await dispatch(initializeAuth());
      navigate('/', { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="sign-in-form">
      <div className="sign-in-form__container">
        <h1 className="e-heading-4 e-600 e-no-selection">
          Welcome to{' '}
          <span className="e-heading-4 e-600 e-brand-title e-accent-title">Einstein</span>
        </h1>
        <p className="e-body-4 e-center e-no-selection">
          Turn Our Knowledge Into Your Greatest Asset
        </p>
        <button
          className="sign-in-form__container-btn e-btn e-btn-md e-btn-primary e-mg-t-24 e-fade-blur"
          onClick={handleLogin}
        >
          Log in with Microsoft
          {/* Use it to show loading state */}
          {/* <Spinner color='var(--e-grayscale-white)' /> */}
        </button>

        {/* <span className='e-error e-mg-t-8'>Failed to authenticate. Try again or contact your manager</span> */}
      </div>

      <div className="sign-in-form__powered">
        <p className="">Powered by</p>
        <img className="sign-in-form__powered-img" src="/tbn.png" alt="" />
      </div>
    </div>
  );
}
