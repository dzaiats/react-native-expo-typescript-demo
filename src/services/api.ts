import { Event, EventShop } from '@/types/api';

const API_BASE_URL = 'https://api.celebratix.io';
const CHANNEL = '56wpw';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('Fetching from:', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Response received, type:', typeof data, 'keys:', Object.keys(data || {}));
      return data as T;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }

  async getEvents(): Promise<Event[]> {
    try {
      const response = await this.request<{
        data?: {
          list?: any[];
          items?: any[];
        };
        items?: any[];
        results?: any[];
        events?: any[];
      }>(`/v2/consumers/Events?channel=${CHANNEL}`);

      let events: any[] = [];

      // Handle the actual API response structure: data.list
      if (response?.data?.list && Array.isArray(response.data.list)) {
        events = response.data.list;
        console.log('Events found in data.list:', events.length);
      } else if (response?.data?.items && Array.isArray(response.data.items)) {
        events = response.data.items;
        console.log('Events found in data.items:', events.length);
      } else if (Array.isArray(response)) {
        events = response;
        console.log('Events found as array:', events.length);
      } else if (response?.items && Array.isArray(response.items)) {
        events = response.items;
        console.log('Events found in items:', events.length);
      } else if (response?.results && Array.isArray(response.results)) {
        events = response.results;
        console.log('Events found in results:', events.length);
      } else if (response?.events && Array.isArray(response.events)) {
        events = response.events;
        console.log('Events found in events:', events.length);
      } else {
        console.warn('No events array found in response:', Object.keys(response || {}));
        return [];
      }

      // Map API response fields to our Event interface
      const mappedEvents: Event[] = events.map((event) => {
        // Extract GUID from image.path (format: "files/b38eb3ea-c845-4453-bd89-af48e8efd6bd")
        let coverImageGuid: string | undefined;
        if (event.image?.path) {
          coverImageGuid = event.image.path.replace(/^files\//, '');
        }

        return {
          ...event,
          title: event.name || event.title || '', // Map 'name' to 'title'
          coverImageGuid,
        };
      });

      console.log('Mapped events:', mappedEvents.length);
      return mappedEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async getEventShop(eventSqid: string): Promise<EventShop> {
    const shop = await this.request<any>(`/shop/v2/${CHANNEL}/${eventSqid}`);
    
    // Map API response to our EventShop interface
    return {
      ...shop,
      title: shop.name || shop.title, // Map 'name' to 'title'
    };
  }

  getImageUrl(guid: string): string {
    return `https://img.celebratix.io/files/${guid}`;
  }
}

export const apiClient = new ApiClient();

