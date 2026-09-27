import { GET as getCompany } from '@/app/api/companies/[id]/route';
import { GET as getMedia } from '@/app/api/media/[type]/[id]/route';
import { notFound } from 'next/navigation';

type MediaType = 'video' | 'playlist';

async function titleFromResponse(response: Response): Promise<string> {
    if (response.status === 404) notFound();
    if (!response.ok) throw new Error(`Title lookup failed with status ${response.status}`);

    const body: unknown = await response.json();
    if (typeof body !== 'object' || body === null || !('title' in body) && !('name' in body)) {
        throw new Error('Title lookup returned an invalid response');
    }
    const title = 'title' in body ? body.title : body.name;
    if (typeof title !== 'string' || !title) throw new Error('Title lookup returned an invalid response');
    return title;
}

// Invoke the internal route handlers in server code so prerendering needs no HTTP server.
export async function getMediaApiTitle(type: MediaType, id: string): Promise<string> {
    const response = await getMedia(new Request(`http://localhost/api/media/${type}/${encodeURIComponent(id)}`), {
        params: Promise.resolve({ type, id }),
    });
    return titleFromResponse(response);
}

export async function getCompanyApiTitle(id: string): Promise<string> {
    const response = await getCompany(new Request(`http://localhost/api/companies/${encodeURIComponent(id)}`), {
        params: Promise.resolve({ id }),
    });
    return titleFromResponse(response);
}
