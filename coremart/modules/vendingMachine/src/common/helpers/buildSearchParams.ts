import { camelToSnakeCase } from '@nikkierp/common/utils';
import { SearchParamsOption } from 'ky';

import { SearchParams } from '../../types';


export const buildFieldsQuery = <T extends object>(fields: Array<keyof T> = []): Array<['fields', string]> => {
	return fields.map((field) => ['fields', camelToSnakeCase(String(field))]);
};

export function buildSearchParams<T extends object>(params?: SearchParams<T>): SearchParamsOption {
	const { page, size, graph, fields } = params ?? {};
	return [
		...(page ? [['page', String(page)]] : []),
		...(size ? [['size', String(size)]] : []),
		...(graph ? [['graph', JSON.stringify(graph)]] : []),
		...buildFieldsQuery<T>(fields || []),
		...(params?.extra ? Object.entries(params.extra).map(([key, value]) => [key, String(value)]) : []),
	];
}


