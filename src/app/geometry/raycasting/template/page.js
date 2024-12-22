import DesktopPage from './desktopPage';
import MobilePage from './mobilePage';
import isMobileDevice from '@/lib/responsive';

export default async function Page() {
	const mobile = await isMobileDevice(); // execute the function
	return (<>{mobile ? <MobilePage /> : <DesktopPage />}</>);
}