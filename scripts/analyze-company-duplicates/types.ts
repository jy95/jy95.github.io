export interface CompanyRecord {
    id: number;
    name: string;
    developerGames: number;
    publisherGames: number;
}

export interface CompanyGroup {
    normalizedName: string;
    companies: CompanyRecord[];
}

export interface SimilarityCandidate {
    left: CompanyGroup;
    right: CompanyGroup;
    score: number;
    signals: string[];
}

export interface ExactDuplicateGroup {
    name: string;
    companies: CompanyRecord[];
}

export interface NormalizedDuplicateGroup {
    normalizedName: string;
    companies: CompanyRecord[];
}

export interface AmbiguousCandidateGroup {
    companies: CompanyGroup[];
    pairs: SimilarityCandidate[];
}

export interface CompanyDuplicateAnalysisReport {
    version: 1;
    generatedAt: string;

    thresholds: {
        fuzzyScore: number;
        minFuzzyNameLength: number;
    };

    companiesScanned: number;

    summary: {
        exactDuplicateGroups: number;
        normalizedDuplicateGroups: number;
        aliasCandidates: number;
        ambiguousGroups: number;
    };

    exactDuplicates: ExactDuplicateGroup[];
    normalizedDuplicates: NormalizedDuplicateGroup[];
    aliasCandidates: SimilarityCandidate[];
    ambiguousCandidates: AmbiguousCandidateGroup[];
}