/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Acumin Pro', 'sans-serif'],
				display: ['var(--font-display)', 'Playfair Display', 'Georgia', 'serif'],
				heading: ['var(--font-display)', 'Playfair Display', 'Georgia', 'serif'],
			},
			letterSpacing: {
				luxe: '0.2em',
				'luxe-lg': '0.3em',
				'luxe-xl': '0.4em',
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				/* Style Villa — Villa palette, anchored to the logo
				   (orchid #A858A0 · sky #00B0F0) */
				brand: {
					purple: '#A958A4',      /* logo orchid */
					blue: '#00AEEF',        /* logo sky blue */
					dark: '#1D1024',        /* deep aubergine */
					white: '#FFFFFF',
					section: '#FAF7FC',     /* lavender-tinted canvas */
					border: '#ECE3F2',      /* lavender hairline */
					heading: '#221826',
					paragraph: '#6F6478',
					hoverPurple: '#8C4188',
					hoverBlue: '#0887B8',
					success: '#3D7C4F',
					error: '#C24B42',
				},
				/* First-class luxury tokens (names kept — values re-anchored to the logo) */
				noir: {
					DEFAULT: '#1D1024',
					soft: '#271631',
					mist: '#321D3E',
				},
				ivory: {
					DEFAULT: '#FAF7FC',
					deep: '#F2ECF7',
					warm: '#FDFBFE',
				},
				/* "gold" keeps its accent role but is now the logo orchid */
				gold: {
					DEFAULT: '#B562B0',
					light: '#E2AEDF',
					dark: '#8C4188',
				},
				/* logo sky blue — the second accent */
				azure: {
					DEFAULT: '#00AEEF',
					light: '#6FD1F8',
					dark: '#0887B8',
				},
				plum: {
					DEFAULT: '#A958A4',
					deep: '#8C4188',
					soft: '#C285BE',
				},
				stone: {
					DEFAULT: '#8D8296',
					dark: '#6F6478',
				},
				line: '#ECE3F2',
				/* Remap Tailwind's default purple/blue scales to the logo palette
				   so legacy utility classes across secondary pages stay on-brand. */
				purple: {
					50: '#FAF5FA',
					100: '#F4E8F3',
					200: '#E7CDE5',
					300: '#D5A9D2',
					400: '#BF7CBB',
					500: '#A958A4',
					600: '#8C4188',
					700: '#70336D',
					800: '#562753',
					900: '#3E1C3C',
					950: '#281026',
				},
				blue: {
					50: '#F0FAFE',
					100: '#DFF4FD',
					200: '#B8E9FB',
					300: '#6FD1F8',
					400: '#2FBEF3',
					500: '#00AEEF',
					600: '#0887B8',
					700: '#0A6C93',
					800: '#0E5878',
					900: '#114A63',
					950: '#0B3042',
				},
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			transitionDuration: {
				900: '900ms',
				1200: '1200ms',
				1400: '1400ms',
				1600: '1600ms',
			},
			transitionTimingFunction: {
				luxe: 'cubic-bezier(0.22, 1, 0.36, 1)',
			},
			keyframes: {
				'marquee-x': {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(-50%)' },
				},
				'fade-up': {
					from: { opacity: '0', transform: 'translateY(24px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				'slow-zoom': {
					from: { transform: 'scale(1.08)' },
					to: { transform: 'scale(1)' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				'spin-slow': {
					to: { transform: 'rotate(360deg)' },
				},
				'float-y': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
			},
			animation: {
				'marquee-x': 'marquee-x 30s linear infinite',
				'fade-up': 'fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
				'slow-zoom': 'slow-zoom 1.6s cubic-bezier(0.22, 1, 0.36, 1) both',
				shimmer: 'shimmer 2.5s linear infinite',
				'spin-slow': 'spin-slow 14s linear infinite',
				'float-y': 'float-y 5s ease-in-out infinite',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
};
