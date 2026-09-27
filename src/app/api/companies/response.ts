import { getCompany, toCompanyDetail } from './data';
import { NextResponse } from 'next/server';

export async function getCompanyResponse(id: string) {
    const company = await getCompany(id);
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

    return NextResponse.json(await toCompanyDetail(company), {
        headers: { 'Cache-Control': 'public, max-age=86400, must-revalidate' },
    });
}
