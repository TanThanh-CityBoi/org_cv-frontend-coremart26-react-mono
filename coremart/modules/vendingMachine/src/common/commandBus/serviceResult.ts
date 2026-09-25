import { Command, CommandResponse, fail, ok } from '@nikkierp/common/commandBus';


/**
 * The return type of every service-layer function in this module. Services never
 * throw: a rejected HTTP call becomes `{ data: null, error }`.
 */
export type ServiceResult<TData> = Promise<CommandResponse<TData, unknown>>;

/**
 * Wraps a throwing HTTP call into a `CommandResponse`. This is the single place
 * the module converts exceptions into the command-bus result shape, so services
 * stay pure HTTP and command handlers stay declarative.
 */
export async function attempt<TData>(fn: () => Promise<TData>): ServiceResult<TData> {
	try {
		return ok(await fn());
	}
	catch (error) {
		return fail(error);
	}
}

/**
 * Renders a `CommandResponse` error as a human-readable string for notifications.
 * Command errors are `unknown` by contract, so callers must not assume `Error`.
 */
export function errorMessage(error: unknown): string | undefined {
	if (error == null) {
		return undefined;
	}
	if (typeof error === 'string') {
		return error;
	}
	if (error instanceof Error) {
		return error.message;
	}
	const message = (error as { message?: unknown }).message;
	return typeof message === 'string' ? message : undefined;
}

/** Narrows a `Command`'s untyped payload at the handler boundary. */
export function payloadOf<TPayload>(command: Command): TPayload {
	return command.payload as TPayload;
}
