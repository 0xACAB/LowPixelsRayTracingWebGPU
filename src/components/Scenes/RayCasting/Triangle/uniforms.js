export default {
	camera: {
		type: 'struct',
		data: {
			eye: {
				bufferSize: 16,//12+padding
				data: [0.0, 0.0, 1.0],
			}
		}
	},
	triangle0: {
		type: 'struct',
		data: {
			points: {
				bufferSize: 48,//36+padding
				data: [
					1.0,
					1.0,
					-1.0,
					-1.0,
					1.0,
					-1.0,
					-1.0,
					-1.0,
					-1.0,
				],
			},
			color: {
				bufferSize: 16,
				data: [
					1.0, 1.0, 1.0,
				]
			},
			material: {
				type: 'struct',
				data: {
					Kd: {
						bufferSize: 16,
						data: [0.6, 0.6, 0.6],
					},
					Ke: {
						bufferSize: 16,
						data: [0.0, 0.0, 0.0],
					},
				}
			}
		}
	},
	iMouse: {
		bufferSize: 8,
		data: [-999.0, -999.0],
	},
};