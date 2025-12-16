# Celebratix Assignment - Mobile App

A React Native mobile application built with Expo, TypeScript, and Zustand for managing events and ticket purchases.

## Features

- **Events List**: Browse and search events with pull-to-refresh functionality
- **Event Details**: View detailed event information with expandable ticket tree structure
- **Ticket Basket**: Add tickets to basket with local persistence
- **QR Code Scanner**: Scan QR codes using device camera
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Type-Safe API Client**: Fully typed API interactions
- **State Management**: Zustand with persistence for basket and theme

## Tech Stack

- **Expo**: ~54.0.0
- **React Native**: 0.81.5
- **React**: 19.1.0
- **TypeScript**: 5.3.3
- **Zustand**: 5.0.2 (State management with persistence)
- **React Navigation**: Bottom tabs and stack navigation
- **Expo Camera**: QR code scanning
- **React Native Toast Message**: Toast notifications

## Dependencies

This project uses Expo SDK 54. **Important**: When running on a physical device using Expo Go, you must use a compatible Expo Go app version that supports Expo SDK 54.

- **Expo Go**: Make sure you have the latest version of Expo Go installed from the App Store (iOS) or Google Play Store (Android)
- **Compatibility**: Expo Go versions are tied to specific Expo SDK versions. This project requires Expo SDK 54, so ensure your Expo Go app is up to date
- **Checking Version**: You can check your Expo Go version in the app settings, or update it from the respective app stores

## Project Structure

```
/src
  /components       # Reusable UI components
  /navigation       # Navigation configuration
  /screens          # Screen components
  /services         # API client and services
  /store            # Zustand stores (events, basket, theme)
  /types            # TypeScript type definitions
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher). I use Node 25.** and npm 11.**
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator
- **Expo Go app** (for testing on physical devices) - Must be compatible with Expo SDK 54

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd celebratix-assignment-denes-zajac
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your physical device (ensure Expo Go is updated to support SDK 54)

## Running the App

### Development Mode

```bash
npm start
```

This will start the Expo development server. You can then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan the QR code with Expo Go app on your device (requires Expo Go compatible with SDK 54)

### Platform-Specific Commands

```bash
# iOS
npm run ios

# Android
npm run android

# Web (limited functionality)
npm run web
```

## Testing

The app includes `testID` attributes on all interactive elements for easy testing. You can use these testIDs with testing frameworks like:

- React Native Testing Library
- Detox
- Appium

### Example Test IDs

- `events-list-screen`: Main events list screen
- `event-card-{sqid}`: Individual event card
- `scanner-screen`: QR code scanner screen
- `tab-events`: Events tab button
- `tab-scanner`: Scanner tab button

To run tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

The test suite includes:

- **Basket Store Tests** (`tests/basketStore.test.ts`):
  - Adding items to basket
  - Incrementing item quantities
  - Decrementing item quantities
  - Removing items from basket
  - Calculating totals and item counts
  - Clearing basket

- **Events Filtering Tests** (`tests/eventsFiltering.test.ts`):
  - Filtering events by title
  - Filtering events by location
  - Case-insensitive filtering
  - Sorting by date (newest first)
  - Sorting by title (alphabetical)
  - Combined filtering and sorting
  - Edge cases (empty arrays, missing data, etc.)

## API Endpoints

The app uses the following API endpoints:

- `GET /v2/consumers/Events?channel=56wpw` - Fetch all events
- `GET /shop/v2/56wpw/{eventSqid}` - Fetch event shop details
- `https://img.celebratix.io/files/{GUID}` - Event images

## Assumptions Made

1. **API Response Structure**: The API may return events in different formats (`items`, `data`, or direct array). The app handles all these cases.

2. **Ticket Tree Structure**: Tickets are organized by `tabSqid` and `groupSqid`. If these are not provided, they default to "default" tab/group.

3. **Image Handling**: Event images use GUIDs from the API. If no `coverImageGuid` is provided, the image section is hidden.

4. **Basket Persistence**: Basket items are persisted locally using AsyncStorage. The basket persists across app restarts.

5. **Theme**: The app follows system theme by default but allows manual toggling. Theme preference is persisted.

6. **QR Code Scanning**: After scanning a QR code, the app shows a toast and redirects to the Events tab after 2 seconds.

7. **Navigation**: The app uses a bottom tab navigator with two tabs (Events and Scanner), with a stack navigator nested in the Events tab for event details.

8. **Error Handling**: API errors are displayed to the user with retry options where appropriate.

9. **Loading States**: Loading skeletons are shown while fetching events. Pull-to-refresh is available on the events list.

10. **Price Formatting**: Prices default to Euro (€) if no currency is specified. Free tickets show as "Free".

## State Management

The app uses Zustand for state management with three main stores:

1. **eventsStore**: Manages events list, loading, and error states
2. **basketStore**: Manages shopping basket with persistence
3. **themeStore**: Manages theme (light/dark) with persistence

## Permissions

The app requires the following permissions:

- **Camera**: Required for QR code scanning (requested at runtime)

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `expo start -c`
2. **Camera not working**: Ensure camera permissions are granted in device settings
3. **API errors**: Check network connection and API endpoint availability
4. **TypeScript errors**: Run `npm install` to ensure all type definitions are installed
5. **Expo Go compatibility errors**: If you see "This project requires a newer version of Expo Go", update the Expo Go app from the App Store/Play Store to the latest version that supports Expo SDK 54
6. **QR code not scanning on device**: Ensure your Expo Go app version is compatible with Expo SDK 54

### Clearing Cache

```bash
expo start -c
```

## Development Notes

- All components include `testID` attributes for testing
- TypeScript strict mode is enabled
- The app supports both iOS and Android
- Dark mode is automatically detected from system settings
- Basket state persists across app restarts

## License

This project is created as part of an assignment.

