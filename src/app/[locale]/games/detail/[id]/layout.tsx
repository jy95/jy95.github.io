import { gameDetailMetadata } from '@/features/games/detail/metadata';

export { default } from "@/components/common/LocaleLayout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
    const { locale, id } = await params;
    return gameDetailMetadata(locale, id);
}