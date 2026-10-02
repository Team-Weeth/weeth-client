import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  // 배포 시 .next 아티팩트가 통째로 교체되어 구 빌드의 청크 URL이 404가 된다.
  // deploymentId를 주면 Next가 클라이언트/서버 빌드 불일치를 감지해
  // 에러 대신 하드 내비게이션으로 복구한다.
  // AWS_COMMIT_ID는 현재 Amplify에서 'HEAD'로 들어와 배포마다 같은 값이 되므로,
  // 빌드마다 반드시 달라지는 AWS_JOB_ID를 쓴다.
  deploymentId: process.env.AWS_JOB_ID,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'weeth-s3-dev.s3.ap-northeast-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'weeth-s3-prod.s3.ap-northeast-2.amazonaws.com',
      },
    ],
  },
};

export default withSentryConfig(withAnalyzer(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'weeth',

  project: 'weeth_v4',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: false,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
