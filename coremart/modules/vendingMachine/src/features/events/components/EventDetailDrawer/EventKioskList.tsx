import React from 'react';

import { AssignedKioskList, AssignedKioskListProps } from '@/components/AssignKiosks';


/** Wrapper cho màn chi tiết sự kiện — dùng copy i18n của events. */
export type EventKioskListProps = AssignedKioskListProps;

export const EventKioskList: React.FC<EventKioskListProps> = ({ translationKeys, ...rest }) => (
	<AssignedKioskList
		{...rest}
		translationKeys={{
			addKiosks: 'coremart.vendingMachine.events.selectKiosks.addKiosks',
			empty: 'coremart.vendingMachine.events.messages.no_kiosks',
			...translationKeys,
		}}
	/>
);
