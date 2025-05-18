# Methods Component

## Overview
The `Methods` component is a dynamic, recursive interface designed to guide users through a multi-level decision-making process. It leverages a hierarchical data structure where each "method" can have nested "sub-methods" that users can select, creating a flexible, user-friendly workflow. The component is built using React with hooks for state management and TypeScript for type safety. This setup allows the component to scale easily to handle varying depths of data.

## Architectural Overview

### 1. **Component Structure**

The `Methods` component consists of several subcomponents, each responsible for a specific aspect of the UI and behavior:

- **`Methods`**: The parent component that initializes the state and coordinates the rendering of method cards.
- **`MethodsProgress`**: Displays the user's progress through the method selection process, showing a visual indicator based on the depth of the selected options.
- **`MethodsHeading`**: Renders the heading for each level in the method hierarchy, dynamically adapting to the current depth.
- **`MethodsRecursive`**: The key component for rendering method cards recursively. This component is responsible for displaying method cards at various depths, ensuring that nested cards (sub-methods) are rendered properly.

The overall design follows a modular approach, allowing easy extensions to add more features, such as additional metadata or interactive elements.

### 2. **Recursive Rendering Approach**

The core architectural choice in this component is the use of **recursive rendering**. This approach is critical for efficiently handling the hierarchical structure of method cards, where each card can have children, each of which may have further children.

#### Why Recursive Rendering is Useful:
- **Dynamic Depth Handling**: The recursive approach allows the component to handle any depth of nested data without needing to hardcode logic for each level. The depth of nesting is determined dynamically based on the structure of the data, making the component flexible and adaptable.
- **Scalability**: As the data structure grows, recursion enables the component to scale effectively, rendering deeper levels of method cards without performance degradation.
- **Maintainability**: By using recursion, the code is simpler and more maintainable, as there’s no need for repetitive code to handle different levels of nesting. Changes to the rendering logic at any depth automatically propagate to all levels of the hierarchy.
  
#### Very Important Note: Recursive Approach Considerations
The recursive approach utilized in this component is based on **best practices** and a **mature design pattern** for hierarchical data rendering. However, it’s important to note that while recursion provides significant flexibility, it might not always be the most efficient or suitable solution for all datasets.

In certain scenarios, such as when the dataset is very large or deeply nested, recursion can cause performance issues or lead to overly complex data management. **If the dataset has too many levels or the performance is hindered**, it may be necessary to **modify the recursive logic** to use an **iterative approach** or **pagination** to limit the depth of rendering. 

In such cases, you can adapt the rendering process by:
- **Flattening the hierarchical structure** into a linear one for easier and faster rendering.
- **Adding a depth limitation** to control how deep the recursion can go and dynamically load nested items as needed (e.g., lazy loading).
- **Using memoization** to cache results and prevent re-renders for previously computed nodes.

### 3. **Component Interactivity**

The `Methods` component tracks user interactions using React’s `useState` and `useEffect` hooks. The `selectedOptions` array stores the choices made by the user, while `MethodsProgress` keeps track of the user's current progress.

- **State Management**: 
  - `currentProgress` tracks the user’s progress through the selection process.
  - `selectedOptions` keeps an array of the user's selected method cards, which is used for controlling which methods are shown and updating the progress.
  - `maxDepth` is dynamically calculated based on the nested structure of the method cards to control the maximum depth of selection.

- **Selecting Options**: The selection of options is handled by `onSelect`, which updates the state based on the user’s current selection. This function ensures that the user's path through the decision tree is tracked, and that the progress is updated accordingly.

### 4. **Data Model and Structure**

The data used by the `Methods` component follows a well-defined structure based on the `IMethodCard` interface. This interface defines the properties for each method card, such as `title`, `children` (for nested method cards), `users`, and `links`.

The key parts of the data model are:
- **`IMethodCard`**: Represents a method card, which can have a `title`, an array of `users`, an array of `links`, and optionally, nested `children` that represent sub-methods.
- **`IMethodCardLink`**: Describes a collection of links associated with a method card.
- **`IMethodCardUser`**: Represents a user associated with a method card, with `firstName` and `lastName`.

This structure ensures that each method card can have dynamic content, from user details to external links, and supports an arbitrary depth of nested cards.

### 5. **Progress Tracking and User Feedback**

The `MethodsProgress` component displays the user’s progress as they select options. The progress is calculated based on the current depth and the number of selections made. This component is crucial for providing users with a clear visual indicator of their progress, motivating them to complete the process.

### 6. **Tech Notes on the `MethodsProgress` Component**

The `MethodsProgress` component provides a visual indicator of progress through the decision-making process. It dynamically updates as the user makes selections and provides real-time feedback on their progress.

#### Key Features:
- **State Management**: 
  - The component uses the `useState` hook to track an array of `completedSteps` representing the steps the user has completed.
  - The `useEffect` hook monitors changes in the `currentProgress` and updates the `completedSteps` accordingly. It ensures that steps are added or removed from the progress list as the user moves forward or backward in the process.
  
- **Progress Logic**:
  - When `currentProgress` increases, new steps are added to the progress list.
  - When `currentProgress` decreases, steps are removed from the progress list with a fade-out animation. The fading effect is triggered by adding a CSS class to the last step, which is then removed after a timeout.
  
- **Rendering**:
  - The progress is displayed as a series of list items. Each item represents a step, and its appearance changes based on whether it's completed or active.
  - A message at the bottom updates the user on their current status: either "Select to start", "Keep going", or "You are all set 🎉".
  
- **Performance Considerations**:
  - The component uses efficient state updates and minimal DOM manipulation. When removing steps, the fading animation ensures a smooth user experience without causing layout thrashing.
  - The `useEffect` hook ensures that the component only re-renders when necessary (i.e., when `currentProgress` changes), improving performance.

#### How the Accordion is Utilized:
The progress updates are visually represented in an accordion format, where each progress step expands as it is completed. This accordion behavior is useful for organizing the steps in a clear, collapsible format, and it dynamically adjusts based on the user's progress.

### 7. **Extending the Component**

The component is designed to be easily extensible. New features can be added by:
- Modifying the `IMethodCard` interface to include new fields, such as additional metadata or interactive elements.
- Adding custom components for each level of interaction, such as additional UI elements for displaying details when a user selects a card.
- Customizing the recursive logic to handle different types of data, such as adding more complex interactions when selecting certain methods.

### IMPORTANT Note: Recursive Approach Considerations
The recursive approach utilized in this component is based on **best practices** and a **mature design pattern** for hierarchical data rendering. This approach provides significant flexibility and scalability for nested data structures.

However, depending on the specific dataset, you may find that the structure of the data does not naturally fit into a recursive model. In such cases, it is highly recommended that the dataset be **remapped** to fit a recursive structure rather than modifying the component itself. By doing so, the core logic and best practices of the component can be preserved, ensuring that the component remains adaptable and easy to maintain.

If the dataset requires different handling or is inherently non-recursive, you can:
- **Transform the dataset into a recursive structure** before passing it to the component.
- **Custom map the data** into a format that aligns with the expected recursive structure, ensuring compatibility with the component’s recursive logic.

If remapping the dataset is not possible, you can modify the component logic itself to handle the data in a way that fits the use case. However, modifying the core component logic should be done cautiously, as it may reduce the component's flexibility and adherence to the intended best practices.

This approach allows you to keep the component flexible and adhere to the established best practices, while still accommodating varying data requirements.
