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
	sphere: {
		type: 'struct',
		data: {
			position: {
				bufferSize: 12,
				data: [0.0, 0.0, -1.0],
			},
			radius: {
				bufferSize: 4,
				data: [0.5],
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
	lightSphere: {
		type: 'struct',
		data: {
			position: {
				bufferSize: 12,
				data: [2.0, 2.0, 0.0],
			},
			radius: {
				bufferSize: 4,
				data: [0.05],
			},
			material: {
				type: 'struct',
				data: {
					Kd: {
						bufferSize: 16,
						data: [0.0, 0.0, 0.0],
					},
					Ke: {
						bufferSize: 16,
						data: [1.0, 1.0, 1.0],
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
