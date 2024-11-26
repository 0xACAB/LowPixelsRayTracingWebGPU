import React, { useState } from 'react';

export default function Slider(
	{
		onChange,
		resolutions,
		defaultResolution = 0,
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