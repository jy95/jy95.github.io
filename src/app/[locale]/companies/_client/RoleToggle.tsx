"use client";

import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import PeopleIcon from "@mui/icons-material/People";
import CodeIcon from "@mui/icons-material/Code";
import BusinessIcon from "@mui/icons-material/Business";

export type RoleFilter = "all" | "developer" | "publisher";

interface RoleToggleProps {
  value: RoleFilter;
  onChange: (value: RoleFilter) => void;
  labels: Record<RoleFilter, string>;
}

export default function RoleToggle({ value, onChange, labels }: RoleToggleProps) {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    nextValue: RoleFilter | null
  ) => {
    if (nextValue !== null) {
      onChange(nextValue);
    }
  };

  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      onChange={handleChange}
      size="small"
      sx={{ mb: 2 }}
      aria-label="role filter"
    >
      <ToggleButton value="all" sx={{ gap: 1 }}>
        <PeopleIcon fontSize="small" />
        {labels.all}
      </ToggleButton>

      <ToggleButton value="developer" sx={{ gap: 1 }}>
        <CodeIcon fontSize="small" />
        {labels.developer}
      </ToggleButton>

      <ToggleButton value="publisher" sx={{ gap: 1 }}>
        <BusinessIcon fontSize="small" />
        {labels.publisher}
      </ToggleButton>
    </ToggleButtonGroup>
  );
}