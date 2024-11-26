const config = {
	content: [
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		fontFamily: {
			sans: ['Helvetica Neue', 'sans-serif'],
		},
		fontSize: {
			xs: '0.75rem',
			sm: '0.875rem',
			base: '1rem',
			lg: '1.125rem',
			xl: '1.25rem',
			'2xl': '1.5rem',
			'3xl': '1.875rem',
			'4xl': '2.25rem',
			'5xl': '3rem',
			'6xl': '4rem',
		},
		extend: {
			colors: {
				primary: '#ec4755',
				secondary: '#a12c34',
				tertiary: '#99a0a3',
				border: '#1a2e35',
				background: '#ffffff',
				col111: '#111',
			},
			animation: {
				vote: 'vote 1s ease-in-out',
			},
			keyframes: {
				vote: {
					'0%, 100%': {
						transform: 'rotate(0deg)',
					},
					'25%': {
						transform: 'rotate(-30deg)',
					},
					'75%': {
						transform: 'rotate(30deg)',
					},
				},
			},
			width: {
				'512': '512px',
				'1024': '1024px',
			},
			height: {
				'256': '256px',
				'512': '512px',
			},
		},
	},
	plugins: [],
};
export default config;
