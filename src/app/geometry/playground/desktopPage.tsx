import React from 'react';
import Playground from '@/components/Scenes/Playground/Playground';
import Link from 'next/link';

export default function DesktopPage() {
	return (
		<div className={`bg-background grid gap-y-0 overflow-hidden`}>
			<div className={`flex items-center flex-col`}><Link href="/">Назад к меню</Link></div>
			<div className={`relative bg-background flex items-center flex-col`}>
				<div className={`max-w-7xl mx-auto`}>
					<main className={`mx-auto max-w-7xl`}>
						<div className={`sm:text-left lg:text-left`}>
							<div className={`flex items-center flex-col`}>
								<Playground />
							</div>
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}