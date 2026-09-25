import { Button, Text, Tooltip } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { IconMapPin } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, To } from 'react-router-dom';


interface AddressLinkProps {
	address?: string | null;
	latitude?: string | null;
	longitude?: string | null;
}
export const AddressLink: React.FC<AddressLinkProps> = ({ address, latitude, longitude }) => {
	const { t: translate } = useTranslation('vending_machine');

	const link = useMemo(() => {
		if (latitude && longitude) {
			return `https://www.google.com/maps?q=${latitude},${longitude}`;
		}
		else if (address) {
			return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
		}
		return undefined;
	}, [latitude, longitude, address]);

	const { hovered, ref } = useHover();


	return (
		<Tooltip label={translate('action.viewOnMap')} withArrow position='left' multiline>
			<Button
				size='xs' p={2}
				variant='transparent'
				leftSection={<IconMapPin size={16} color={hovered ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-gray-6)'} />}
				component={Link}
				to={link as To}
				target='_blank'
				rel='noopener noreferrer'
				justify='flex-start'
				onClick={(e) => {
					e.stopPropagation();
				}}
				ref={ref}
				w={'max-content'}
			>
				<Text size='sm' c={hovered ? 'var(--mantine-color-blue-6)' : 'dimmed'} lineClamp={1} style={{ maxWidth: 200 }}>
					{address}
				</Text>
			</Button>
		</Tooltip>
	);
};