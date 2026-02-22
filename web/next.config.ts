import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import path from "path";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  reactCompiler: true,
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
