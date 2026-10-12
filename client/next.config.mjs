/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "desirediv-storage.blr1.digitaloceanspaces.com",
            },
            {
                protocol: "https",
                hostname: "pub-67f953912205445f932ab892164f22e5.r2.dev",
            },
        ]
    },
    experimental: {
        webpackBuildWorker: false,
    },
    // The real product route is /products/[slug]. Older builds linked to
    // /product/[slug] (Watch & Buy "View"), so send those visitors to the right page.
    async redirects() {
        return [
            { source: "/product/:slug", destination: "/products/:slug", permanent: false },
        ];
    },
};

export default nextConfig;
