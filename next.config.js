/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
      ignoreDuringBuilds: true,
        },
          images: {
              remotePatterns: [
                    { protocol: "https", hostname: "*.supabase.co" },
                          { protocol: "https", hostname: "placehold.co" },
                                { protocol: "https", hostname: "images.unsplash.com" },
                                    ],
                                        dangerouslyAllowSVG: true,
                                            contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
                                              },
                                                experimental: {
                                                    serverActions: {
                                                          bodySizeLimit: "10mb",
                                                              },
                                                                },
                                                                  webpack: (config) => {
                                                                      config.externals = [...(config.externals || []), { canvas: "canvas" }];
                                                                          return config;
                                                                            },
                                                                            };
                                                                            
                                                                            module.exports = nextConfig; */
