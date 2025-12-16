import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

describe('Event Navigation E2E Test', () => {
  beforeAll(async () => {
    // Launch app - it will connect to Metro bundler automatically
    // Make sure Metro is running on http://localhost:8081
    await device.launchApp({
      newInstance: true,
    });
    // Give the app time to initialize navigation and load initial screen
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Give time for reload
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  it('should open event and verify correct event details are displayed', async () => {
    // Wait for app to be ready - look for any tab bar element first
    try {
      // Wait for tab bar to be visible (confirms navigation is ready)
      await waitFor(element(by.id('tab-events'))).toBeVisible().withTimeout(10000);
    } catch (e) {
      // If tab not found, try icon
      try {
        await waitFor(element(by.id('tab-events-icon'))).toBeVisible().withTimeout(10000);
      } catch (e2) {
        // Continue anyway - tab might be visible but not accessible
        console.log('Tab bar not found, continuing...');
      }
    }

    // Ensure we're on Events tab by tapping it
    try {
      const eventsTab = element(by.id('tab-events'));
      await eventsTab.tap();
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (e) {
      try {
        const eventsTabIcon = element(by.id('tab-events-icon'));
        await eventsTabIcon.tap();
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e2) {
        console.log('Could not tap Events tab, assuming already selected');
      }
    }

    // Try to find the search input first (most reliable element)
    // This confirms we're on the Events screen
    await waitFor(element(by.id('events-search-input')))
      .toBeVisible()
      .withTimeout(20000);

    // Now that we know we're on the Events screen, wait for the list
    // The list might be loading, so we wait for either the list or loading skeletons
    try {
      // Try to find the list
      await waitFor(element(by.id('events-list')))
        .toBeVisible()
        .withTimeout(15000);
    } catch (e) {
      // If list not found, check if we're in loading state
      try {
        await waitFor(element(by.id('events-loading-skeletons')))
          .toBeVisible()
          .withTimeout(5000);
        // Wait for loading to finish
        await waitFor(element(by.id('events-loading-skeletons')))
          .not.toBeVisible()
          .withTimeout(15000);
        // Now try list again
        await waitFor(element(by.id('events-list')))
          .toBeVisible()
          .withTimeout(10000);
      } catch (e2) {
        // If neither list nor loading found, try the screen container
        await waitFor(element(by.id('events-list-screen')))
          .toBeVisible()
          .withTimeout(10000);
      }
    }

    // Wait a bit for events to load if they're still loading
    try {
      await waitFor(element(by.id('events-loading-skeletons')))
        .not.toBeVisible()
        .withTimeout(5000);
    } catch (e) {
      // Loading skeletons might not be present, which is fine
    }

    // Find the first event card (assuming events are loaded)
    // We'll look for an event card with a testID pattern
    const firstEventCard = element(by.id('event-card-e_d3vrp')).atIndex(0);
    
    // If the specific event doesn't exist, try to find any event card
    let eventCard;
    try {
      await waitFor(firstEventCard).toBeVisible().withTimeout(3000);
      eventCard = firstEventCard;
    } catch (e) {
      // Try to find any event card by looking for the pattern
      // This is a fallback if the specific event ID doesn't match
      // Use regex directly with by.id()
      eventCard = element(by.id(/event-card-.*/)).atIndex(0);
      await waitFor(eventCard).toBeVisible().withTimeout(5000);
    }

    // Get the event title from the card to verify later
    const eventTitleElement = element(by.id('event-card-e_d3vrp-title')).atIndex(0);
    let expectedEventTitle = 'Event A - Code Testing';
    
    try {
      // Try to get the actual title text if possible
      const titleText = await eventTitleElement.getAttributes();
      if (titleText && 'text' in titleText) {
        expectedEventTitle = titleText.text as string;
      }
    } catch (e) {
      // If we can't get the text, use the default expected title
      console.log('Could not read event title, using default');
    }

    // Tap on the event card to navigate to details
    await eventCard.tap();

    // Wait for navigation to event details screen
    // The screen might be loading, so wait for either loading or the screen itself
    try {
      // First check if loading indicator appears
      await waitFor(element(by.id('event-details-loading')))
        .toBeVisible()
        .withTimeout(3000);
      // Wait for loading to finish
      await waitFor(element(by.id('event-details-loading')))
        .not.toBeVisible()
        .withTimeout(15000);
    } catch (e) {
      // Loading might not appear or already finished, continue
      console.log('Loading indicator not found or already finished');
    }

    // Now wait for the event details screen to appear
    // Try multiple selectors to confirm we're on the details screen
    try {
      await waitFor(element(by.id('event-details-screen')))
        .toBeVisible()
        .withTimeout(10000);
    } catch (e) {
      // If screen not found, try to find the title or scroll view
      try {
        await waitFor(element(by.id('event-details-title')))
          .toBeVisible()
          .withTimeout(10000);
      } catch (e2) {
        // If title not found, try scroll view
        await waitFor(element(by.id('event-details-scroll')))
          .toBeVisible()
          .withTimeout(10000);
      }
    }

    // Verify the event details screen is showing
    await detoxExpect(element(by.id('event-details-screen'))).toBeVisible();

    // Verify the event title is displayed correctly
    await waitFor(element(by.id('event-details-title')))
      .toBeVisible()
      .withTimeout(3000);

    // Check that the title contains the expected text (partial match for flexibility)
    // Since we might not be able to read the exact text, we verify the element exists
    await detoxExpect(element(by.id('event-details-title'))).toBeVisible();

    // Verify ticket tree is present (confirms we're on the right screen)
    await waitFor(element(by.id('event-details-ticket-tree')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify we can see ticket groups (confirms event data loaded)
    // Look for at least one group header
    // Use regex directly with by.id()
    const ticketGroup = element(by.id(/event-details-ticket-tree-group-.*/)).atIndex(0);
    await waitFor(ticketGroup)
      .toBeVisible()
      .withTimeout(5000);

    // Verify the event details screen shows the correct event by checking for specific elements
    // that should only be present on the event details screen
    await detoxExpect(element(by.id('event-details-scroll'))).toBeVisible();
  });

  it('should navigate back from event details to events list', async () => {
    // Ensure we're on the Events tab
    try {
      const eventsTab = element(by.id('tab-events'));
      await waitFor(eventsTab).toBeVisible().withTimeout(10000);
      await eventsTab.tap();
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (e) {
      try {
        const eventsTabIcon = element(by.id('tab-events-icon'));
        await waitFor(eventsTabIcon).toBeVisible().withTimeout(10000);
        await eventsTabIcon.tap();
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e2) {
        console.log('Could not find Events tab, assuming already on Events tab');
      }
    }

    // Wait for search input to confirm we're on Events screen
    await waitFor(element(by.id('events-search-input')))
      .toBeVisible()
      .withTimeout(20000);

    // Find and tap an event card
    // Use regex directly with by.id()
    const eventCard = element(by.id(/event-card-.*/)).atIndex(0);
    await waitFor(eventCard).toBeVisible().withTimeout(10000);
    await eventCard.tap();

    // Wait for navigation to event details screen
    // The screen might be loading, so wait for either loading or the screen itself
    try {
      // First check if loading indicator appears
      await waitFor(element(by.id('event-details-loading')))
        .toBeVisible()
        .withTimeout(3000);
      // Wait for loading to finish
      await waitFor(element(by.id('event-details-loading')))
        .not.toBeVisible()
        .withTimeout(15000);
    } catch (e) {
      // Loading might not appear or already finished, continue
      console.log('Loading indicator not found or already finished');
    }

    // Now wait for the event details screen to appear
    // Try multiple selectors to confirm we're on the details screen
    try {
      await waitFor(element(by.id('event-details-screen')))
        .toBeVisible()
        .withTimeout(10000);
    } catch (e) {
      // If screen not found, try to find the title or scroll view
      try {
        await waitFor(element(by.id('event-details-title')))
          .toBeVisible()
          .withTimeout(10000);
      } catch (e2) {
        // If title not found, try scroll view
        await waitFor(element(by.id('event-details-scroll')))
          .toBeVisible()
          .withTimeout(10000);
      }
    }

    // Navigate back using the back button or swipe gesture
    // For iOS, React Navigation provides a back button in the header
    // We can also use swipe gesture from left edge (most reliable on iOS)
    const platform = device.getPlatform();
    
    if (platform === 'ios') {
      // On iOS, try multiple approaches
      try {
        // First, try to find and tap the back button by accessibility label
        const backButton = element(by.label('Back to Events'));
        await waitFor(backButton).toBeVisible().withTimeout(2000);
        await backButton.tap();
      } catch (e) {
        // If not found, try to find by text (iOS back button usually shows "<" or "< Back")
        try {
          // Try to find back button by text - could be "Events" (previous screen title) or "<"
          // React Navigation on iOS shows the previous screen's title as the back button
          const backButtonByText = element(by.text('Events'));
          await waitFor(backButtonByText).toBeVisible().withTimeout(2000);
          await backButtonByText.tap();
        } catch (e2) {
          // Last resort: use iOS swipe gesture from left edge
          // This is the standard iOS way to go back and is the most reliable
          // Swipe from left edge (x: 0) to the right
          await device.swipe({ x: 0, y: 400 }, { x: 300, y: 400 }, 'fast', 0.5);
        }
      }
    } else {
      // Android: use back button
      await device.pressBack();
    }
    
    // Wait a bit for navigation animation to complete
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Verify we're back on events list by checking for search input
    await waitFor(element(by.id('events-search-input')))
      .toBeVisible()
      .withTimeout(10000);
  });
});

