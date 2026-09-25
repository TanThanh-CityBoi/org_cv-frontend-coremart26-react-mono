import { schemaRegistry } from '@nikkierp/common/dynamicModel';
import {
	AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, MicroAppRouter, WidgetRoutes,
} from '@nikkierp/ui/microApp';

import * as c from './constants';
import { registerEventCommands } from './features/events/commands';
import { registerGameCommands } from './features/games/commands';
import { registerKioskModelCommands } from './features/kioskModels/commands';
import { registerKioskCommands } from './features/kiosks/commands';
import { registerKioskSettingCommands } from './features/kioskSettings/commands';
import { registerMediaPlaylistCommands } from './features/mediaPlaylist/commands';
import { registerOrderCommands } from './features/orders/commands';
import { registerPaymentCommands } from './features/payment/commands';
import { registerThemeCommands } from './features/themes/commands';
import { buildVendingMachineMenu } from './menu';
import { appRoutes, renderAppRoutes, widgetRoutes, renderWidgetRoutes } from './routes';


function Main(props: MicroAppProps) {
	return (
		<MicroAppProvider {...props}>
			<MicroAppRouter
				domType={props.domType}
				basePath={props.routing.basePath}
				widgetName={props.widgetName}
				widgetProps={props.widgetProps}
			>
				<AppRoutes>
					{renderAppRoutes(appRoutes)}
				</AppRoutes>
				<WidgetRoutes>
					{renderWidgetRoutes(widgetRoutes)}
				</WidgetRoutes>
			</MicroAppRouter>
		</MicroAppProvider>
	);
}

/**
 * Publishes the dynamic-model schemas this module owns.
 *
 * `resourcePath` uses the underscore form `v1/vending_machine/...`, which is what
 * `transport/restful/index.go` actually mounts. The OpenAPI spec's hyphenated
 * `/v1/vending-machine` is stale.
 *
 * The kiosk-stock schemas carry a `primaryResourcePath` instead: they are nested, so their
 * base path resolves to `{primaryResourcePath}/{kioskId}/{resourcePath}` and every call must
 * supply the owning kiosk id. See `features/kiosks/kioskStockService.ts`.
 */
function registerModelSchemas(): void {
	schemaRegistry.register([
		{
			schemaName: c.PAYMENT_SCHEMA_NAME,
			resourcePath: 'v1/vending_machine/payments',
		},
		{
			schemaName: c.KIOSK_SCHEMA_NAME,
			resourcePath: 'v1/vending_machine/kiosks',
		},
		{
			schemaName: c.KIOSK_MODEL_SCHEMA_NAME,
			resourcePath: 'v1/vending_machine/kiosk-models',
		},
		{
			schemaName: c.KIOSK_SETTING_SCHEMA_NAME,
			resourcePath: 'v1/vending_machine/kiosk-settings',
		},
		{
			schemaName: c.KIOSK_EVENT_SCHEMA_NAME,
			resourcePath: 'v1/vending_machine/events',
		},
		{
			// Nested under its event, like the kiosk-stock schemas below: the backend serves
			// `/events/:event_id/event-stocks`, never a flat `kiosk-event-stocks`.
			schemaName: c.KIOSK_EVENT_STOCK_SCHEMA_NAME,
			primaryResourcePath: 'v1/vending_machine/events',
			resourcePath: 'event-stocks',
		},
		{
			schemaName: c.THEME_SCHEMA_NAME,
			resourcePath: 'v1/vending_machine/themes',
		},
		{
			schemaName: c.GAME_SCHEMA_NAME,
			resourcePath: 'v1/vending_machine/games',
		},
		{
			schemaName: c.ORDER_SCHEMA_NAME,
			resourcePath: 'v1/vending_machine/orders',
		},
		{
			schemaName: c.KIOSK_MEDIA_SCHEMA_NAME,
			resourcePath: 'v1/vending_machine/kiosk-media',
		},
		{
			schemaName: c.PLAYLIST_SCHEMA_NAME,
			resourcePath: 'v1/vending_machine/playlists',
		},
		{
			schemaName: c.KIOSK_STOCK_SCHEMA_NAME,
			primaryResourcePath: 'v1/vending_machine/kiosks',
			resourcePath: 'kiosk-stocks',
		},
		{
			schemaName: c.KIOSK_STOCK_POSITION_SCHEMA_NAME,
			primaryResourcePath: 'v1/vending_machine/kiosks',
			resourcePath: 'positions',
		},
		{
			schemaName: c.KIOSK_LOG_SCHEMA_NAME,
			resourcePath: 'v1/vending_machine/kiosk-logs',
		},
	]);
}

const bundle: MicroAppBundle = {
	init({ htmlTag, slug, host }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, {
			htmlTag,
			domType,
		});

		registerModelSchemas();
		host.menuRegistry.register(buildVendingMachineMenu(slug));
		registerPaymentCommands(host.commandBus);
		registerKioskModelCommands(host.commandBus);
		registerKioskSettingCommands(host.commandBus);
		registerEventCommands(host.commandBus);
		registerMediaPlaylistCommands(host.commandBus);
		registerThemeCommands(host.commandBus);
		registerGameCommands(host.commandBus);
		registerOrderCommands(host.commandBus);
		registerKioskCommands(host.commandBus);

		// No `registerReducer`: every feature now owns its state in `vendingMachineStore`
		// (`src/store.ts`) via `@storeService`. Omitting it is the migration signal — the Shell
		// injects no reducer for this module, exactly as `nikkierp/modules/identity` does.
		return {
			domType,
		};
	},
};

export default bundle;
