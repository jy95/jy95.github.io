import { getCompanyResponse } from '@/app/api/companies/response';
import { getMediaResponse } from '@/app/api/metadata/response';
import { notFound } from 'next/navigation';

type MediaType = 'video' | 'playlist';

type ApiMetadata = { title: string; imagePath: string };

async function metadataFromResponse(response: Response): Promise<ApiMetadata> {
    if (response.status === 404) notFound();
    if (!response.ok) throw new Error(`Title lookup failed with status ${response.status}`);

    const body: unknown = await response.json();
    if (typeof body !== 'object' || body === null || (!('title' in body) && !('name' in body)) || !('imagePath' in body)) {
        throw new Error('Title lookup returned an invalid response');
    }
    const title = 'title' in body ? body.title : body.name;
    if (typeof title !== 'string' || !title || typeof body.imagePath !== 'string' || !body.imagePath) {
        throw new Error('Title lookup returned an invalid response');
    }
    return { title, imagePath: body.imagePath };
}

// Reuse the route response builders so prerendering needs no HTTP server or URL.
export async function getMediaApiMetadata(type: MediaType, id: string): Promise<ApiMetadata> {
    return metadataFromResponse(await getMediaResponse(type, id));
}

export async function getCompanyApiMetadata(id: string): Promise<ApiMetadata> {
    return metadataFromResponse(await getCompanyResponse(id));
}
