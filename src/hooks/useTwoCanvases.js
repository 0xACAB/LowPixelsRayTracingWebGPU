import { useEffect, useRef } from 'react';

export const useTwoCanvases = (callback) => {
	const canvas1Ref = useRef(null);
	const canvas2Ref = useRef(null);

	useEffect(() => {
		const canvas1 = canvas1Ref.current;
		const canvas2 = canvas2Ref.current;
		const context2 = canvas2.getContext('webgpu');
		return callback([canvas1, canvas2, context2]);
	}, []);

	return [canvas1Ref, canvas2Ref];
};