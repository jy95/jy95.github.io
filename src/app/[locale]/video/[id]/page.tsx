import { createMediaPage } from '@/features/games/mediaPage';

const { generateMetadata, generateStaticParams, Page } = createMediaPage('video');

export { generateMetadata, generateStaticParams };
export default Page;
