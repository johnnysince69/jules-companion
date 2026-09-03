# Jules Monitor

Jules Monitor is a React Native iOS/Android application built using Expo. Its primary purpose is to help developers remotely monitor the status, plans, and recent activities of Jules (the AI software engineer) via a mobile dashboard.

## Prerequisites

Before running the application, ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/en/) (LTS recommended)
*   [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
*   [Expo CLI](https://docs.expo.dev/more/expo-cli/) (comes with the `npx expo` commands used in the boilerplate)
*   An iOS Simulator (requires Xcode on a Mac) or an Android Emulator (requires Android Studio). Alternatively, you can run it on your physical mobile device using the Expo Go app.

## Project Workflow & Architecture

1.  **Authentication**:
    The app uses the Jules REST API for authentication. The user inputs their `Jules API Key` into the dashboard. This key is securely stored in local state and passed to the API via the `x-goog-api-key` header.
2.  **Dashboard Screen**:
    *   **Status Card**: Fetches the most recent session from `/v1alpha/sessions`. It highlights the session's overall state (e.g., `QUEUED`, `PLANNING`, `IN_PROGRESS`, `COMPLETED`).
    *   **Activity Feed**: Uses the extracted session ID to fetch an ordered timeline of events from `/v1alpha/sessions/{sessionId}/activities`. This provides real-time updates on what step of a plan Jules is currently executing.
3.  **Design System**:
    The application follows a dark-mode technical aesthetic designed via Stitch, leveraging a custom color palette defined in `Dashboard.js` (`#0b1326` backgrounds, `#007aff` electric blue accents).

## How to Run

1.  Navigate into the project directory:
    ```bash
    cd jules-monitor
    ```

2.  Install dependencies (if not already installed):
    ```bash
    npm install
    ```

3.  Start the Metro bundler:
    ```bash
    npx expo start
    ```

    *   To run on **iOS**: Press `i` in the terminal to launch the iOS simulator. (Mac only).
    *   To run on **Android**: Press `a` in the terminal to launch the Android emulator.
    *   To run on a **physical device**: Download the Expo Go app on your phone and scan the QR code displayed in your terminal.

## Troubleshooting

*   If the app fails to fetch data, ensure that your Jules API key is correct and hasn't been revoked.
*   If the app crashes during compilation, run `npx expo export` to check for build errors.
