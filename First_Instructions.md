# Project File Analysis Instructions

This document outlines the guidelines for performing a line-by-line analysis of the project files. Adherence to these instructions is crucial for identifying issues, suggesting improvements, and ensuring code quality, maintainability, and best practices.

## General Code Quality

1.  **Readability and Clarity:**
    *   Code should be easy to read and understand.
    *   Avoid overly complex logic or convoluted expressions.
    *   Ensure consistent formatting (indentation, spacing).
2.  **Comments:**
    *   Functions, complex logic blocks, and non-obvious code sections should have clear, concise comments.
    *   Avoid redundant comments that merely restate the obvious.
3.  **Variable and Function Naming:**
    *   Use descriptive and meaningful names for variables, functions, classes, and components.
    *   Follow a consistent naming convention (e.g., camelCase for variables/functions, PascalCase for components/classes).
4.  **Redundancy and Duplication:**
    *   Identify and suggest refactoring for duplicated code blocks.
    *   Avoid unnecessary variables, functions, or imports.
5.  **Maintainability:**
    *   Code should be easy to modify, extend, and debug.
    *   Minimize side effects and tightly coupled components.

## TypeScript Best Practices

1.  **Type Safety:**
    *   Ensure proper type annotations for variables, function parameters, and return types.
    *   Avoid excessive use of `any`. If `any` is necessary, provide a clear justification.
    *   Utilize interfaces and types for complex data structures.
2.  **Enums and Union Types:**
    *   Prefer enums or union types for representing a fixed set of values.
3.  **Error Handling:**
    *   Properly type error objects and handle potential runtime errors.

## React Best Practices

1.  **Component Structure:**
    *   Components should be small, focused, and reusable.
    *   Follow a clear component hierarchy.
    *   Use functional components with hooks over class components where appropriate.
2.  **Hooks Usage:**
    *   Ensure correct usage of React Hooks (e.g., `useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`).
    *   Follow Rules of Hooks.
3.  **State Management:**
    *   Manage component state effectively, avoiding unnecessary re-renders.
    *   Use `useContext` for global state where Redux/Zustand is overkill.
4.  **Props:**
    *   Clearly define prop types using TypeScript interfaces.
    *   Avoid prop drilling by using context or composition.
5.  **Keys in Lists:**
    *   Ensure unique `key` props are provided for elements in lists to optimize rendering.
6.  **Accessibility (A11y):**
    *   Check for semantic HTML elements and appropriate ARIA attributes.
    *   Ensure interactive elements are keyboard navigable.

## Tailwind CSS Usage

1.  **Consistency:**
    *   Apply Tailwind classes consistently across components.
    *   Avoid inline styles where Tailwind classes are available.
2.  **Responsiveness:**
    *   Properly use responsive utility classes (e.g., `sm:`, `md:`, `lg:`) for different screen sizes.
3.  **Customization:**
    *   Verify that `tailwind.config.ts` is configured appropriately for project-specific themes and styles.

## File Organization

1.  **Modularity:**
    *   Files and folders should be organized logically, promoting modularity and separation of concerns.
    *   Group related files together (e.g., components, hooks, contexts, services).
2.  **Clear Responsibilities:**
    *   Each file or module should have a single, clear responsibility.

## Performance Considerations

1.  **Optimization:**
    *   Identify potential performance bottlenecks (e.g., excessive re-renders, large bundle sizes, inefficient data fetching).
    *   Suggest memoization (`React.memo`, `useMemo`, `useCallback`) where appropriate.

## Security Considerations

1.  **Input Sanitization:**
    *   Ensure user inputs are properly sanitized and validated to prevent security vulnerabilities (e.g., XSS).
2.  **Environment Variables:**
    *   Properly handle environment variables, especially sensitive ones.

## Output Format

For each line, output the analysis in the following format:
Line [number]: [analysis]

Example:
Line 1: Function definition adheres to PEP 8, but lacks a docstring. Suggest adding a docstring to describe functionality.
Line 2: Variable 'x' is unused. Recommend removing to improve code cleanliness.

After each chunk, conclude with:
Analysis completed up to line [number]

This allows resumption from the next line if the analysis is interrupted.

## Note on Large Files

To manage large files efficiently, provide the file content in chunks, specifying the line numbers to analyze. For example:
Analyze lines 1 to 100 of the project file:
[Insert lines 1-100 here]

In the next prompt, continue with:
Analyze lines 101 to 200 of the project file:
[Insert lines 101-200 here]
