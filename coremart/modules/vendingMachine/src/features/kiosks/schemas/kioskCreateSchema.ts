import type { ModelSchema } from '@nikkierp/common/dynamicModel';


/**
 * Form schema for creating and editing a kiosk.
 *
 * Hand-authored rather than fetched: the create form is rendered before any record exists, and
 * the fields below are the subset the create/update commands accept. Shape must match
 * `dyn.ModelSchemaField` — `AutoField` switches on `data_type.name`, and `useFieldData` reads
 * `is_required_for_{create,update}`.
 *
 * `label` values are `$ref` lang-json pointers resolved at render time against the
 * `vending_machine` i18n namespace, whose keys are flat dotted strings.
 */
export const kioskCreateSchema: ModelSchema = {
	name: 'kiosk',
	fields: {
		id: {
			name: 'id',
			label: { '$ref': 'kiosk.fields.id' },
			data_type: { name: 'ulid' },
			is_primary_key: true,
			is_auto_generated: true,
		},
		etag: {
			name: 'etag',
			label: { '$ref': 'common.fields.etag' },
			data_type: { name: 'nikkiEtag' },
			is_system_field: true,
		},
		name: {
			name: 'name',
			label: { '$ref': 'kiosk.fields.name' },
			data_type: {
				name: 'string',
				options: { length: [1, 128] },
			},
			is_required_for_create: true,
			is_required_for_update: true,
		},
		displayName: {
			name: 'displayName',
			label: { '$ref': 'kiosk.fields.display_name' },
			data_type: {
				name: 'string',
				options: { length: [0, 128] },
			},
		},
		code: {
			name: 'code',
			label: { '$ref': 'kiosk.fields.code' },
			data_type: {
				name: 'string',
				options: { length: [1, 128] },
			},
			is_required_for_create: true,
			// The kiosk device identifies itself by code, so it is fixed once the record exists.
			no_update: true,
		},
		locationAddress: {
			name: 'locationAddress',
			label: { '$ref': 'kiosk.fields.location_address' },
			data_type: { name: 'string' },
		},
		latitude: {
			name: 'latitude',
			label: { '$ref': 'kiosk.fields.latitude' },
			data_type: { name: 'string' },
		},
		longitude: {
			name: 'longitude',
			label: { '$ref': 'kiosk.fields.longitude' },
			data_type: { name: 'string' },
		},
		mode: {
			// `StaticEnumSelectField` builds each option's label key as `{field.name}.{value}`, and
			// the namespace groups enum labels under the schema (`kiosk.mode.pending`). The map key
			// above — not this — is the form field name, so prefixing here only steers translation.
			name: 'kiosk.mode',
			label: { '$ref': 'kiosk.fields.mode' },
			data_type: {
				name: 'enumString',
				// Wire values the backend's `KioskMode` accepts; `slideshow-only` has no matching
				// `kiosk.mode.slideshow-only` key (the namespace spells it `slideshow_only`), so
				// that one option falls back to its key until the translation is added.
				options: { enumValues: ['pending', 'selling', 'slideshow-only'] },
			},
		},
		modelRef: {
			name: 'modelRef',
			label: { '$ref': 'kiosk_models.fields.model' },
			data_type: { name: 'ulid' },
			is_required_for_create: true,
			is_required_for_update: true,
		},
		uiMode: {
			name: 'uiMode',
			label: { '$ref': 'kiosk.fields.ui_mode' },
			data_type: {
				name: 'enumString',
				options: { enumValues: ['normal', 'focus'] },
			},
		},
		paymentRefs: {
			name: 'paymentRefs',
			label: { '$ref': 'kiosk.fields.payment_methods' },
			data_type: { name: 'ulid', is_array: true },
		},
	},
};
