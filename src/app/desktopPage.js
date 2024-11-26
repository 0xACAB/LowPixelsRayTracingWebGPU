import React from 'react';
import About from '@/components/About';

export default function DesktopPage() {
	return (
		<div className={`bg-background grid gap-y-0 overflow-hidden`}>
			<About />
		</div>
	);
}