export default function Slider(
	{
		resolutions,
		resolutionIndex,
		ref
	}) {
	return (
		<>
			Resolution:
			<input
				className={`w-52 m-0`}
				type="range"
				name="slider"
				defaultValue={resolutionIndex}
				min="0"
				max={resolutions.length - 1}
				ref={ref}
			/>
			<label htmlFor="slider">
				{`${resolutions[resolutionIndex].width}x${resolutions[resolutionIndex].height}`}
			</label>

		</>
	);
}