import { createModuleStore } from '@nikkierp/ui/appState/store';


/**
 * This module's own Redux store, separate from the Shell's.
 *
 * Created at module scope because `@storeService` runs at import time: a service file
 * decorated with `@storeService('X', vendingMachineStore)` evaluates this binding while it
 * is itself being imported, so the store must already exist. **This file must not import
 * the services** — they import it, and the reverse direction would be a cycle.
 *
 * The name must stay `'vending_machine'`: `ModuleStoreProvider` looks the store up by
 * `props.slug`, and `dispatchServiceMethod` resolves it from the method's tag.
 *
 * Imported from `@nikkierp/ui/appState/store`, never the `@nikkierp/ui/appState` barrel —
 * that barrel re-exports `routingSlice`, which reads `window.location` at import time and
 * throws outside a browser.
 */
export const vendingMachineStore = createModuleStore('vending_machine');
