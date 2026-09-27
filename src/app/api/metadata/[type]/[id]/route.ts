import { getMediaResponse } from '@/app/api/metadata/response';

type Params = { params: Promise<{ type: string; id: string }> };

export async function GET(_request: Request, { params }: Params) {
    const { type, id } = await params;
    return getMediaResponse(type, id);
}
