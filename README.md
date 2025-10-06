# Wathiq: An Arabic-First Business Management Application

## Project Overview

Wathiq is a comprehensive business management application designed with an Arabic-first approach. It helps users manage various aspects of their daily business operations, including finance, sales, customer relations, marketing, operations, and reporting. The application emphasizes robust data management, an intuitive user interface, and full internationalization support for the Arabic language.

## Key Features

*   **Dashboard**: Provides a high-level overview of key business metrics and daily activity.
*   **Finance Management**: Track income, expenses, investments, and liquidity with robust form validation.
*   **Sales Management**: Manage sales meetings, track client interactions, and monitor meeting outcomes.
*   **Customer Management**: Maintain customer records, track their status, and manage estimated values.
*   **Operations Management**: Oversee daily business operations, track status, and monitor completion rates.
*   **Marketing Management**: Manage marketing tasks and track new customer arrivals from marketing efforts.
*   **Supplier Management**: Add, view, edit, and delete supplier information, including associated documents, with robust form validation.
*   **Data Management**: Comprehensive tools for data backup, restore, and cleanup.
*   **Download Center**: Access and download various reports in PDF and CSV formats, with progress tracking.
*   **Reporting**: Generate detailed daily reports for all business sections, with an integrated report viewer.
*   **Theming**: Supports both light and dark modes, with system theme synchronization.
*   **Accessibility**: Enhanced screen reader support and keyboard navigation.
*   **Arabic-First Design**: Full internationalization for the Arabic language, including localized text, date formatting, and RTL (Right-to-Left) UI adjustments.

## Technologies Used

This project is built with:

*   **Vite**: A fast build tool that provides a lightning-fast development experience.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and maintainability.
*   **React**: A declarative, component-based JavaScript library for building user interfaces.
*   **Shadcn UI**: A collection of reusable components built with Radix UI and Tailwind CSS, providing a beautiful and accessible UI.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
*   **date-fns**: A modern JavaScript date utility library for efficient date manipulation and formatting.
*   **React Router**: For declarative routing in the application.
*   **React Query**: For data fetching, caching, and state management.
*   **jsPDF**: A client-side JavaScript PDF generation library, utilized for creating Arabic PDFs.

## How to Set Up and Run the Project Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (comes with Node.js) or Yarn or Bun

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/sultan0alshami/wathiq.git # Replace with your actual repo URL
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd wathiq
    ```
3.  **Install dependencies:**
    ```sh
    npm install # or yarn install or bun install
    ```
4.  **Start the development server:**
    ```sh
    npm run dev # or yarn dev or bun dev
    ```

The application will now be running on `http://localhost:5173` (or another port if 5173 is in use).

## Deployment

To deploy the frontend to Vercel, see `DEPLOY_TO_VERCEL.md`. You will need to set the following environment variables in the Vercel project:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Optionally add `VITE_API_URL` if you connect a backend.

## Contributing

We welcome contributions! Please refer to our `CONTRIBUTING.md` (if available) for guidelines on how to contribute to this project.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

[Sultan Alshami] - [sultan12alshami@gmail.com/+966534820384]

Project Link: [https://github.com/sultan0alshami/wathiq](https://github.com/sultan0alshami/wathiq)
