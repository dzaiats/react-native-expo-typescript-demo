import { device, waitFor } from 'detox';
import { LOCATORS } from './locators';

const TIMEOUT_5_SECONDS = 5000;
const LONG_TIMEOUT_10_SECONDS = 10000;

const waitForElement = async (locator: () => any, timeout: number = TIMEOUT_5_SECONDS) => {
  try {
    await waitFor(locator()).toBeVisible().withTimeout(timeout);
    return true;
  } catch {
    return false;
  }
};

const tapElement = async (locator: () => any, timeout: number = TIMEOUT_5_SECONDS) => {
  const element = locator();
  await waitFor(element).toBeVisible().withTimeout(timeout);
  await element.tap();
};

export const helpers = {
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  navigateToEventsTab: async () => {
    if (await waitForElement(LOCATORS.tabEvents, TIMEOUT_5_SECONDS)) {
      await tapElement(LOCATORS.tabEvents, TIMEOUT_5_SECONDS);
      return;
    }

    if (await waitForElement(LOCATORS.tabEventsIcon, TIMEOUT_5_SECONDS)) {
      await tapElement(LOCATORS.tabEventsIcon, TIMEOUT_5_SECONDS);
      return;
    }

    console.log('Could not find Events tab, assuming already on Events tab');
  },

  waitForEventsScreen: async () => {
    await waitFor(LOCATORS.eventsSearchInput())
      .toBeVisible()
      .withTimeout(TIMEOUT_5_SECONDS);

    if (!(await waitForElement(LOCATORS.eventsList, TIMEOUT_5_SECONDS))) {
      await waitFor(LOCATORS.eventsListScreen())
        .toBeVisible()
        .withTimeout(TIMEOUT_5_SECONDS);
    }
  },

  searchEvents: async (searchText: string) => {
    const searchInput = LOCATORS.eventsSearchInput();
    await waitFor(searchInput).toBeVisible().withTimeout(TIMEOUT_5_SECONDS);
    await searchInput.clearText();
    await searchInput.typeText(searchText);
    await helpers.delay(1000);
  },

  findAndTapEventCard: async (eventTitle?: string) => {
    if (eventTitle) {
      const eventCardByTitle = LOCATORS.eventCardByTitle(eventTitle);
      try {
        await waitFor(eventCardByTitle).toBeVisible().withTimeout(TIMEOUT_5_SECONDS * 3);
        await eventCardByTitle.tap();
        return;
      } catch (e) {
        console.log(`Event card with title "${eventTitle}" not found, trying first available card`);
      }
    }

    const eventCard = LOCATORS.eventCard();
    await waitFor(eventCard).toBeVisible().withTimeout(LONG_TIMEOUT_10_SECONDS);
    await eventCard.tap();
  },

  waitForEventDetailsScreen: async () => {
    await waitForElement(LOCATORS.eventDetailsScreen, TIMEOUT_5_SECONDS);

    await waitForElement(LOCATORS.eventDetailsTitle, TIMEOUT_5_SECONDS);

    await waitFor(LOCATORS.eventDetailsScroll())
      .toBeVisible()
      .withTimeout(TIMEOUT_5_SECONDS);
  },

  navigateBack: async () => {
    if (device.getPlatform() === 'ios') {
      if (await waitForElement(LOCATORS.backButton, 2000)) {
        await tapElement(LOCATORS.backButton, 2000);
        return;
      }

      if (await waitForElement(LOCATORS.backButtonByText, 2000)) {
        await tapElement(LOCATORS.backButtonByText, 2000);
        return;
      }

      await device.swipe({ x: 0, y: 400 }, { x: 300, y: 400 }, 'fast', 0.5);
      return;
    }

    await device.pressBack();
  },
};
