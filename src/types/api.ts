export interface Event {
  id: number;
  sqid: string;
  name: string;
  title?: string; // Mapped from name
  coverImageGuid?: string; // Mapped from image.path
  startDate?: string;
  endDate?: string;
  location?: string;
  city?: string | null;
  image?: {
    path?: string;
  };
  shortDescription?: string | null;
  [key: string]: any;
}

export interface TicketGroup {
  id: number;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  type: string;
  sortIndex: number;
  collapsed: boolean;
  ticketTypes: string[]; // Array of ticket type IDs
  children?: TicketGroup[];
  [key: string]: any;
}

export interface EventShop {
  sqid: string;
  name: string;
  title?: string; // Mapped from name
  children?: TicketGroup[];
  ticketTypes?: any[];
  ticketTypeDictionary: Record<string, TicketTypeInfo>;
  currency?: string;
  [key: string]: any;
}

export interface TicketType {
  sqid: string;
  ticketTypeSqid: string;
  tabSqid?: string;
  groupSqid?: string;
  [key: string]: any;
}

export interface TicketTypeInfo {
  id: string;
  sqid?: string; // Mapped from id
  name: string;
  title?: string; // Mapped from name
  description?: string | null;
  price?: number;
  currency?: string;
  serviceFee?: number;
  [key: string]: any;
}

export interface BasketItem {
  ticketTypeSqid: string;
  ticketTypeInfo: TicketTypeInfo;
  quantity: number;
  eventSqid: string;
  eventTitle: string;
}

