# AI Developer Toolbox

A modern, AI-powered developer toolbox for code generation, debugging, web design, and documentation.

The AI Developer Toolbox is a mobile-first web application that leverages the high-speed Groq API to provide developers with a powerful suite of AI-driven tools. The interface is designed with a sleek, glassmorphism and Web3 aesthetic, built with Tailwind CSS for a responsive and visually stunning experience.

## **Features**

* **Project Management:** Create, list, and delete projects with ease. All project data is securely stored in your browser's local storage.
* **Contextual AI Chat:** An intuitive chat interface allows you to interact with the AI. You can add local files, directories, or URLs to the project's context for more accurate and relevant AI responses.
* **AI-Powered Actions:**
    * **Generate Code:** Instruct the AI to write code in various programming languages.
    * **Debug Code:** Get expert assistance in identifying and fixing bugs in your code.
    * **Generate Web Design:** Describe a web design, and the AI will generate the HTML and CSS for you.
    * **Create Documentation:** Automatically generate Markdown documentation and manuals from your code.
* **Chat History:** All conversations are saved in local storage, specific to each project, so you can easily reference past interactions.
* **Code Render Panel:** Instantly preview AI-generated HTML, CSS, and JavaScript code in a dedicated render panel.
* **AI Settings:** Customize the AI's parameters, including system prompts, temperature, AI model, and max tokens per second, to fine-tune its performance.

## **Future Enhancements**

The AI Developer Toolbox is designed to be a constantly evolving platform. Here are some of the features planned for future releases:

* **Chrome Extension & PWA:** For enhanced accessibility and offline capabilities.
* **Version Control Integration:** Seamlessly manage your code with Git integration.
* **Real-time Collaboration:** Work on projects with your team in real-time.
* **Plugin Architecture:** Extend the app's functionality with community-built plugins and integrations.
* **Advanced Debugging Tools:** Integrate a step-through debugger and other advanced debugging features for a more powerful debugging experience.
* **Deployment Integration:** Deploy your projects directly to your favorite hosting provider without leaving the app.
* **Cloud Storage Sync:** Sync your projects and settings across multiple devices using cloud storage solutions.

## **Code Structure**

The application is structured to be modular and easily extensible, making it simple to add new features in the future.

/
|-- public/
|   |-- index.html
|   |-- styles.css
|-- src/
|   |-- components/
|   |   |-- AIAssistant/
|   |   |   |-- ChatView.js
|   |   |   |-- HistoryView.js
|   |   |-- CodeRenderer/
|   |   |   |-- RenderPanel.js
|   |   |-- Layout/
|   |   |   |-- Header.js
|   |   |   |-- Sidebar.js
|   |   |   |-- Footer.js
|   |   |-- ProjectManagement/
|   |   |   |-- ProjectList.js
|   |   |   |-- CreateProject.js
|   |   |-- Settings/
|   |   |   |-- SettingsPage.js
|   |-- services/
|   |   |-- groqAPI.js
|   |   |-- localStorage.js
|   |-- styles/
|   |   |-- tailwind.css
|   |   |-- main.css
|   |-- App.js
|   |-- index.js
|-- package.json
|-- README.md

### **Structure Breakdown**

* **`public/`**: Contains the main HTML file and any static assets.
* **`src/`**: The main source code of the application.
    * **`components/`**: Reusable UI components.
        * **`AIAssistant/`**: Components related to the AI chat and history.
        * **`CodeRenderer/`**: The component for rendering AI-generated code.
        * **`Layout/`**: Components for the main application layout, including the header, sidebar, and footer.
        * **`ProjectManagement/`**: Components for creating, listing, and deleting projects.
        * **`Settings/`**: The component for the AI settings page.
    * **`services/`**: Modules for handling external services and local storage.
        * **`groqAPI.js`**: Functions for interacting with the Groq API.
        * **`localStorage.js`**: Helper functions for managing data in local storage.
    * **`styles/`**: CSS files, including Tailwind CSS and any custom styles.
    * **`App.js`**: The main application component.
    * **`index.js`**: The entry point of the application.
* **`package.json`**: Project dependencies and scripts.
* **`README.md`**: This file.

This modular structure promotes a clean separation of concerns, making it easy to maintain and scale the application over time.

## **Getting Started**

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/benneberg/groq-ai-code-craft.git]
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up your Groq API key:**
    * Create a `.env` file in the root of the project.
    * Add your Groq API key to the `.env` file:
        ```
        REACT_APP_GROQ_API_KEY=your_api_key_here
        ```
4.  **Start the development server:**
    ```bash
    npm start
    ```

Now you can open your browser and start using the **AI Developer Toolbox** to accelerate your development workflow!