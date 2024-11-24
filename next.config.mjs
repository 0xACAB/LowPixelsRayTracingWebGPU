/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	experimental: {
		forceSwcTransforms: true,
	},
	poweredByHeader: false,
	trailingSlash: true,
	/*async redirects() {
		return [
			{
				source: '/math',
				destination: '/',
				permanent: true,
			},
		]
	},*/
	webpack: (config) => {
		config.module.rules.push(
			{
				test: /\.(glsl|vs|fs)$/,
				loader: 'ts-shader-loader',
			});

		return config;
	},
};

export default nextConfig;
