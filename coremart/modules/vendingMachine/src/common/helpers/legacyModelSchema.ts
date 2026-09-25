import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Adapts a locally-authored schema — a `*-schema.json` import or an inline literal — to the
 * `dyn.ModelSchema` that `AutoTable` and `AutoForm` now take.
 *
 * These schemas predate the dynamic-model registry: their fields carry `type`/`label` instead of
 * `data_type`/`name`, and the label is a pseudo-JSON `$ref` string rather than a lang-json map.
 * The renderers still accept that shape at runtime — `AutoTable.normalizeLegacyLabelRef` exists
 * for it, and `useLocalize` resolves a plain string as a translation key — so only the static type
 * needs bridging. Structural assignability cannot express it, hence the widening cast.
 *
 * This is a migration shim: a schema that moves to the registry should be resolved by
 * `schemaName` instead and drop this call.
 */
export function asLegacyModelSchema(schema: unknown): dyn.ModelSchema {
	return schema as dyn.ModelSchema;
}
