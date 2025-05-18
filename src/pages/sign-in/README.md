# SignIn Component

The `SignIn` component is a fully responsive sign-in page implemented using React with TypeScript. It features a sign-in form, a mask for visual effects, and an optional loading spinner that can be used during authentication or data processing.

## Features
- **Responsive Layout:** The page adjusts based on screen size using breakpoints and mixins. On smaller screens, the layout is stacked, while on larger screens, the form is centered and takes up 50% of the width.
- **Sign-in Form:** Contains the form elements required for users to sign in, including inputs and buttons.
- **Sign-in Mask:** Provides a background visual overlay effect behind the form, which is hidden on smaller screens for better mobile UX.
- **Loading Spinner:** A spinner component is used to indicate a loading state during form submission or when the application is processing the user's data.

## Files
- `SignIn.tsx`: Contains the main React component, which renders the `SignInForm`, `SignInMask`, and optionally the loading spinner.
- `sign-in.scss`: The SCSS file that styles the `SignIn` component using mixins and breakpoints for responsive behavior.

## Spinner Usage

The spinner is displayed when the sign-in form is in a loading state, typically triggered when the user submits the form and the system is processing their credentials. 

### Integration

To integrate the spinner, you can follow these steps:

1. **Add the Spinner Component**:
   - Import the spinner component (if it's a separate component) or add the spinner's JSX inside the `SignIn` component.
   - For example, if you have a `Spinner` component, import it like so:
     ```tsx
     import Spinner from './components/spinner';  // Adjust path accordingly
     ```

2. **Manage Loading State**:
   - Use a state variable to track whether the form is in a loading state. You can do this by adding a `useState` hook to manage this state:
     ```tsx
     const [loading, setLoading] = useState(false);
     ```

3. **Display the Spinner**:
   - Conditionally render the spinner based on the `loading` state. If `loading` is `true`, show the spinner. For example, place it above or within the form:
     ```tsx
     {loading && <Spinner />} // 24px and --e-primary-500 by default
     ```
