import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;

export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  return useSyncExternalStore(
    subscribe,
    (): S | C => client,
    (): S | C => server,
  );
}
