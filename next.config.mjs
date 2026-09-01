import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Cualquier página se puede leer como Markdown añadiendo `.md` a su URL.
      // Alimenta el botón "Copiar Markdown" y permite compartir una página en
      // texto plano. Ver app/llms.mdx/[lang]/docs/[[...slug]]/route.ts
      {
        source: '/:lang/docs/:path*.md',
        destination: '/llms.mdx/:lang/docs/:path*',
      },
      {
        source: '/:lang/docs.md',
        destination: '/llms.mdx/:lang/docs',
      },
    ];
  },
};

export default withMDX(config);
