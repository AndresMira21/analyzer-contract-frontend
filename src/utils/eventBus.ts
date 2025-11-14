export type AuthEventTopic = 'auth:login_attempt' | 'auth:register_click';

type Handler<T> = (payload: T) => void;

class EventBus<Topic extends string = string> {
  private static instance: EventBus<any> | null = null;
  private topics = new Map<Topic, Set<Handler<any>>>();

  private constructor() {}

  static getInstance<T extends string>(): EventBus<T> {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus<T>();
    }
    // TypeScript limitation: cast to generic when retrieving singleton
    return EventBus.instance as EventBus<T>;
  }

  subscribe<K extends Topic>(topic: K, handler: Handler<unknown>): () => void {
    const set = this.topics.get(topic) ?? new Set<Handler<unknown>>();
    set.add(handler);
    this.topics.set(topic, set);
    return () => set.delete(handler);
  }

  publish<K extends Topic>(topic: K, payload: unknown): void {
    const set = this.topics.get(topic);
    if (!set) return;
    set.forEach((h) => {
      try {
        h(payload);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[EventBus]', e);
      }
    });
  }
}

export const authEventBus = EventBus.getInstance<AuthEventTopic>();