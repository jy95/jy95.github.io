import { gameDetailMetadata } from '@/features/games/detail/metadata';
import PageClient from './PageClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
    const { locale, id } = await params;
    return gameDetailMetadata(locale, id);
}

export default function Page({ params }: { params: Promise<{ locale: string; id: string }> }) {
    return <PageClient params={params} />;
}
