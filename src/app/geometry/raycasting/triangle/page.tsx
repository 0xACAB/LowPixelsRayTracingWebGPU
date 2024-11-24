import DesktopPage from './desktopPage';
import MobilePage from './mobilePage';
import React from 'react';
import isMobileDevice from '@/lib/responsive';

export default async function Page() {
	const mobile: boolean = await isMobileDevice(); // execute the function
	return (<>{mobile ? <MobilePage /> : <DesktopPage />}</>);
}