import { storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import { mockKioskDevices } from './mockKioskDevices';
import { vendingMachineStore } from '../../store';


import type { KioskDevice } from './types';


export type GetKioskDeviceRequest = { id: string };
export type CreateKioskDeviceRequest = Omit<KioskDevice, 'id' | 'createdAt' | 'etag'>;
export type UpdateKioskDeviceRequest = {
	id: string,
	etag: string,
	updates: Partial<Omit<KioskDevice, 'id' | 'createdAt' | 'etag'>>,
};
export type DeleteKioskDeviceRequest = { id: string };


/**
 * Kiosk devices.
 *
 * **Still mock-backed.** Unlike theme and game (APPST-010), this resource has no backend
 * counterpart at all — there is no `vending_machine_kiosk_device` schema and no device route in
 * the vending_machine route table, so there is nothing to point a real call at. The `mockKioskDevices`
 * fixture is therefore kept as the data source and only the *state layer* migrates: the feature
 * gains a module-store slice and `useServiceLayer` in place of its Redux slice.
 *
 * Swap the fixture calls for `request.*` once the device endpoints land.
 */
@storeService('KioskDeviceService', vendingMachineStore)
export class KioskDeviceService {
	@storeAsyncMethod
	public async list(): Promise<KioskDevice[]> {
		return mockKioskDevices.listKioskDevices();
	}

	@storeAsyncMethod
	public async getById({ id }: GetKioskDeviceRequest): Promise<KioskDevice | undefined> {
		return mockKioskDevices.getKioskDevice(id);
	}

	@storeAsyncMethod
	public async create(device: CreateKioskDeviceRequest): Promise<KioskDevice> {
		return mockKioskDevices.createKioskDevice(device);
	}

	@storeAsyncMethod
	public async update({ id, etag, updates }: UpdateKioskDeviceRequest): Promise<KioskDevice> {
		return mockKioskDevices.updateKioskDevice(id, etag, updates);
	}

	@storeAsyncMethod
	public async delete({ id }: DeleteKioskDeviceRequest): Promise<void> {
		return mockKioskDevices.deleteKioskDevice(id);
	}
}

export const kioskDeviceStoreService = new KioskDeviceService();
