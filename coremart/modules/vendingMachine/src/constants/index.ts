/**
 * The micro-app slug. MUST match `MicroAppMetadata.slug` in the hosting app
 * (`coremart/apps/webapp/src/main.tsx`) and the backend ERP module name.
 *
 * The command bus resolves an unknown command by taking `name.split('.')[0]` as
 * the slug and lazy-loading that micro-app, so every command this module handles
 * must be prefixed with this value.
 */
export const VENDING_MACHINE_MODULE = 'vending_machine';

// Dynamic-model schema names. These must match the backend Go constants verbatim —
// `SchemaRegistry` rejects a schema whose response name differs from the registered one, which
// leaves the page loading forever with no error surfaced. Copied from
// backend-coremart26-mono/coremart/modules/vending_machine/domain/*_entity.go.
export const GAME_SCHEMA_NAME = 'vending_machine_game';
export const KIOSK_SCHEMA_NAME = 'vending_machine_kiosk';
export const KIOSK_EVENT_SCHEMA_NAME = 'vending_machine_kiosk_event';
export const KIOSK_MEDIA_SCHEMA_NAME = 'vending_machine_kiosk_media';
export const KIOSK_MODEL_SCHEMA_NAME = 'vending_machine_kiosk_model';
export const KIOSK_SETTING_SCHEMA_NAME = 'vending_machine_kiosk_setting';
export const ORDER_SCHEMA_NAME = 'vending_machine_order';
export const PAYMENT_SCHEMA_NAME = 'vending_machine_payment';
export const PLAYLIST_SCHEMA_NAME = 'vending_machine_playlist';
export const THEME_SCHEMA_NAME = 'vending_machine_theme';

// Nested under its event (`/v1/vending_machine/events/{id}/event-stocks`): registered with a
// `primaryResourcePath`, so every call must pass the owning event id. See `eventStockCrudService.ts`.
export const KIOSK_EVENT_STOCK_SCHEMA_NAME = 'vending_machine_kiosk_event_stock';

// Nested under a kiosk: registered with a `primaryResourcePath`, so every call must pass the
// owning kiosk id as the trailing `primaryResourceId` argument. See `kioskStockService.ts`.
export const KIOSK_STOCK_SCHEMA_NAME = 'vending_machine_kiosk_stock';
export const KIOSK_STOCK_POSITION_SCHEMA_NAME = 'vending_machine_kiosk_stock_position';
export const KIOSK_LOG_SCHEMA_NAME = 'vending_machine_kiosk_log';
