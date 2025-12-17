import { by, element } from 'detox';

export const LOCATORS = {
  tabEvents: () => element(by.id('tab-events')),
  tabEventsIcon: () => element(by.id('tab-events-icon')),

  eventsSearchInput: () => element(by.id('events-search-input')),
  eventsList: () => element(by.id('events-list')),
  eventsListScreen: () => element(by.id('events-list-screen')),

  eventCard: (sqid?: string) =>
    sqid ? element(by.id(`event-card-${sqid}`)).atIndex(0) : element(by.id(/event-card-.*/)).atIndex(0),
  eventCardByTitle: (title: string) => element(by.text(title)),

  eventDetailsScreen: () => element(by.id('event-details-screen')),
  eventDetailsTitle: () => element(by.id('event-details-title')),
  eventDetailsScroll: () => element(by.id('event-details-scroll')),
  eventDetailsTicketTree: () => element(by.id('event-details-ticket-tree')),
  eventDetailsTicketGroup: () => element(by.id(/event-details-ticket-tree-group-.*/)).atIndex(0),

  backButton: () => element(by.label('Back to Events')),
  backButtonByText: () => element(by.text('Events')),
};
