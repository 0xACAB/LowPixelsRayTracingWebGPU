import React, { useState } from 'react';
import { resolution } from '@/components/interfaces';

export default function Slider(
	{
		onChange,
		resolutions,
		defaultResolution = 0,
	}: {
		onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
		resolutions: Array<resolution>;
		defaultResolution?: number,
	}) {
	const [state, setState] = useState(defaultResolution);
	return (
		<>
			Resolution:
			<input
				className={`w-52 m-0`}
				type="range"
				name="slider"
				defaultValue={defaultResolution}
				min="0"
				max={resolutions.length - 1}
				onChange={(event) => {
					setState(event.target.valueAsNumber);
					onChange(event);
				}}
			/>
			<label htmlFor="slider">
				{`${resolutions[state].width}x${resolutions[state].height}`}
			</label>

		</>
	);
}