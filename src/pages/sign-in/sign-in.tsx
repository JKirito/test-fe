import { SignInForm } from './components/sign-in-form/sign-in-form';
import { SignInMask } from './components/sign-in-mask/sign-in-mask';

import './sign-in.scss';

export default function SignIn() {
  return (
    <div className="sign-in">
      <SignInMask />
      <SignInForm />
    </div>
  );
}
