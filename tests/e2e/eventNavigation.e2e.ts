import { device, waitFor } from 'detox';
import { expect } from '@jest/globals';
import { LOCATORS } from './helpers/locators';
import { helpers } from './helpers/helpers';

const TIMEOUT_5_SECONDS = 5000;

describe('Event Navigation E2E Test', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
    });
  });

  beforeEach(async () => {
    //await device.reloadReactNative(); - just in case we need to reload the state of the app
    // Navigate to Events tab
    await helpers.navigateToEventsTab();

    // Wait for Events screen to be ready
    await helpers.waitForEventsScreen();
  });

  it('should search for Event B, open it and verify details', async () => {
    await helpers.searchEvents('Event B\n');

    await helpers.findAndTapEventCard('Event B - Code Testing');

    await helpers.waitForEventDetailsScreen();

    const eventTitle = LOCATORS.eventDetailsTitle();
    await waitFor(eventTitle)
      .toBeVisible()
      .withTimeout(TIMEOUT_5_SECONDS);

    const titleAttributes = await eventTitle.getAttributes();
    if (titleAttributes && 'text' in titleAttributes) {
      expect(titleAttributes.text).toContain('Event B');
    }

    await waitFor(LOCATORS.eventDetailsTicketTree())
      .toBeVisible()
      .withTimeout(TIMEOUT_5_SECONDS);

    await waitFor(LOCATORS.eventDetailsTicketGroup())
      .toBeVisible()
      .withTimeout(TIMEOUT_5_SECONDS);

    await helpers.navigateBack();

    await waitFor(LOCATORS.eventsSearchInput())
        .toBeVisible()
        .withTimeout(TIMEOUT_5_SECONDS);
  });
});
