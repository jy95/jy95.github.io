import { createMediaPage } from '@/features/games/mediaPage';

const { generateMetadata, generateStaticParams, Page } = createMediaPage('playlist');

export { generateMetadata, generateStaticParams };
export default Page;
