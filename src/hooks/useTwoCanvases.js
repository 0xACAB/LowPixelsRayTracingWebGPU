import { useEffect, useRef } from 'react';

export const useTwoCanvases = (name1, name2, callback) => {
	const canvas1Ref = useRef(null);
	const canvas2Ref = useRef(null);

	useEffect(() => {
		const canvas1 = canvas1Ref.current;
		const canvas2 = canvas2Ref.current;
		return callback([canvas1, canvas2]);
	}, []);

	return {
		[name1]: canvas1Ref,
		[name2]: canvas2Ref,
	};
};