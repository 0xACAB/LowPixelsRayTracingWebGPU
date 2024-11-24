import React from 'react';
import Link from 'next/link';

export default function Page() {
	return (
		<>
			<div className={`flex items-center flex-col`}>{'Листки НМУ'}</div>
			<div className={`flex justify-left`}>
				<div>
					<Link className={`m-1`} href="/math/algebra">Алгебра</Link>
				</div>
				<div>
					<Link className={`m-1`} href="/math/analysis">Анализ</Link>
				</div>
				<div>
					<Link className={`m-1`} href="/math/geometry">Геометрия</Link>
				</div>
			</div>
		</>
	);
}