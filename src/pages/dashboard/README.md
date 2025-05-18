# Dashboard Component

This project implements a dashboard UI with interactive cards. The dashboard allows users to navigate to different sections, each representing various aspects of project preparation, benchmarking, and cost estimation. The components are built with React and TypeScript for type safety and modularity.

## Overview

The dashboard consists of several interactive cards, each containing a title, subtitle, and icon. Clicking on a card navigates the user to a specific page corresponding to the card’s data. This allows for easy access to tools like project insights, methods, geospatial views, and more.

## Features

- **Dynamic Dashboard Cards**: Cards are rendered dynamically based on the data provided in the `DashboardCards` array.
- **Routing**: Each card is linked to a specific URL using React Router’s `useNavigate` hook, allowing seamless navigation between different sections of the app.
- **Reusable Components**: The `DashboardCard` component is reusable, with dynamic props passed to customize each card’s content.
- **Responsive Design**: The layout is designed to be flexible and mobile-friendly, using SCSS for styling.
- **Animated Page Heading**: The page heading includes an animated greeting and user-centric welcome message, enhancing the user experience.
- **Reusable Background Component**: The `Background` component creates a visually appealing Gaussian blur effect with glowing circles, which can be used on any page as needed.
- **Header Component**: Added a note suggesting the `Header` component should be used only on entry pages to avoid unnecessary repetition across multiple pages.

## Cards in the Dashboard

The dashboard contains several cards, each with the following attributes:

- **`path`**: URL path to navigate to when the card is clicked.
- **`title`**: Title displayed on the card.
- **`subtitle`**: Short description or information related to the card.
  
Here are the available cards:

1. **Curiosity**  
   Path: `/curiosity`  
   Subtitle: "Powered Insights & Recommendations For Your Projects & Pitches."

2. **Methods**  
   Path: `/methods`  
   Subtitle: "Standardized Processes, Templates & Best Practices For Your Projects & Pitches."

3. **Maps**  
   Path: `/maps`  
   Subtitle: "Geospatial Views Of Our Projects And Their Artifacts For Your Pitches."

4. **Galileo**  
   Path: `/galileo`  
   Subtitle: "Benchmark & Analytics For Your Projects & Pitches."

5. **Abacus-Cost**  
   Path: `/abacus-cost`  
   Subtitle: "Cost Estimate Benchmarking Tool."

6. **How To**  
   Path: `/how-to`  
   Subtitle: "From inception to close out."

## Code Structure

### 1. `IDashboardCard` Interface

The `IDashboardCard` interface defines the structure of the data for each card. The attributes ensure that each card has the necessary information for navigation and display.

```ts
export interface IDashboardCard {
    path: string;          // The route path for navigation.
    title: string;         // The title to display on the card.
    subtitle: string;      // A brief description or subtitle for the card.
    onClick?: () => void;  // An optional function for handling card clicks.
}
