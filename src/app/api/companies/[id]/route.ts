import { getCompanyResponse } from '../response';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return getCompanyResponse(id);
}
