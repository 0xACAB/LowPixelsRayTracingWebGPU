export default function MobilePage() {
	return (
		<div className={`bg-background grid gap-y-16 overflow-hidden`}>
			<div className={`relative bg-background flex items-center flex-col`}>
				<div className="max-w-7xl mx-auto">
					<main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-16 lg:px-8 xl:mt-16">
						<div className="sm:text-center lg:text-left">
							<h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
								<span className="block clear-both">{'Мобильная'}</span>
								<span className={`block text-primary`}>{'версия'}</span>
							</h1>
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}