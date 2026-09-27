import { loadCompanies } from "@/app/api/companies/data";
import CompanyDetailClient from "./CompanyDetailClient";

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
    const companies = await loadCompanies();
    return companies.map((company) => ({ id: String(company.id) }));
}

export default async function CompanyDetailPage({ params }: Props) {
    const { id } = await params;
    return <CompanyDetailClient id={id} />;
}
