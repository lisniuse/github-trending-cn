# GitHub-Trending Desktop App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)](https://github.com/lisniuse/CodeBundle/blob/main/LICENSE)

A cross-platform desktop application built with Electron and React to browse GitHub Trending repositories, featuring automatic translation of repository descriptions to Chinese.

## Key Features

*   **Browse Trending Repos:** View daily, weekly, and monthly trending repositories on GitHub.
*   **Chinese Translation:** Automatically translates English repository descriptions into Chinese using the OpenRouter API (requires configuration). Original descriptions can still be viewed.
*   **Detailed Information:** Displays repository name, author, description, programming language, star count, fork count, and stars gained today/this week/this month.
*   **Local Caching:** Fetched data is cached locally to reduce network requests and improve loading speed. Configurable update interval.
*   **History View:** Keeps a separate history of repositories that have appeared on the trending lists since you started using the app.
*   **Proxy Support:** Configure an HTTP/SOCKS proxy for accessing GitHub and the translation API if needed.
*   **Settings Panel:**
    *   Configure your OpenRouter API key.
    *   Set the data update interval (in hours).
    *   Set a proxy server URL.
    *   Choose the interface language (English/Chinese).
    *   Clear cached data for specific periods or all periods.
*   **Cross-Platform:** Builds available for Windows, macOS, and Linux.
*   **External Links:** Easily open repository URLs in your default browser.

## Screenshots

*(Add screenshots of the application interface here)*

*   Main Trending View
*   History View
*   Settings Modal

## Installation / Running from Source

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/lisniuse/CodeBundle.git
    cd CodeBundle
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run in development mode:**
    This will start the Vite development server and the Electron app.
    ```bash
    npm run dev
    ```

## Usage

1.  Launch the application.
2.  **Important:** Go to `Settings` (usually an icon or menu item) and configure your **OpenRouter API Key** to enable description translation. You can get a key from [openrouter.ai](https://openrouter.ai/).
3.  Optionally, configure a proxy URL and adjust the data update interval in Settings.
4.  Select the desired time period (Daily, Weekly, Monthly) using the tabs.
5.  Browse the trending repositories. Click on a repository title or URL to open it in your browser.
6.  Use the "Show original" / "查看原文" toggle within a repository item to switch between translated and original descriptions.
7.  Navigate to the "History" tab to view repositories previously seen on the trending lists.
8.  Use the "Refresh" button to manually fetch the latest data, respecting the cache interval unless forced.
9.  Use the "Clear Local Data" button in Settings to clear the cached trending lists if needed.

## Configuration

Settings are accessed within the application:

*   **OpenRouter API Key:** Required for translating descriptions. Get yours at [openrouter.ai](https://openrouter.ai/). The app uses the `deepseek/deepseek-r1-distill-llama-70b:free` model via OpenRouter.
*   **Data Update Interval:** How often the app should automatically check for new trending data (default: 6 hours).
*   **Proxy Server:** Optional. Enter your proxy URL if needed (e.g., `http://127.0.0.1:7890` or `socks5://127.0.0.1:1080`).
*   **Interface Language:** Choose between English and Chinese for the UI elements.

## Building the Application

To build executable packages for different platforms:

*   **Build for Windows:**
    ```bash
    npm run build:win
    ```
*   **Build for macOS:**
    ```bash
    npm run build:mac
    ```
*   **Build for Linux:**
    ```bash
    npm run build:linux
    ```
*   **Build for All (Windows, macOS, Linux):**
    ```bash
    npm run build:all
    ```

Built packages will be located in the `dist` directory.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.