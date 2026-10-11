import Box from "@mui/material/Box";
import type { ReactNode } from "react";

type Props = { testIdPrefix: string; search: ReactNode; sort: ReactNode };

/** Search on the left, sort on the right; wraps on narrow screens. */
export default function CatalogListToolbar({ testIdPrefix, search, sort }: Props) {
    return (
        <Box data-testid={`${testIdPrefix}-toolbar`} sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: { xs: 1, sm: 2 }, minWidth: 0 }}>
            <Box data-testid={`${testIdPrefix}-search`} sx={{ flex: { xs: "1 1 100%", md: "1 1 300px" }, maxWidth: { md: 560 }, minWidth: 0 }}>
                {search}
            </Box>
            <Box data-testid={`${testIdPrefix}-sort`} sx={{ ml: "auto", flex: { xs: "1 1 160px", md: "0 0 280px" }, maxWidth: { xs: 240, md: 280 }, minWidth: 0 }}>
                {sort}
            </Box>
        </Box>
    );
}
