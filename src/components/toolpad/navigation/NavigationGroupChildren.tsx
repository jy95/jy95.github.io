import type { ReactNode } from "react";
import List from "@mui/material/List";

interface Props {
  children: ReactNode;
  childrenId: string;
  mini: boolean;
}

export default function NavigationGroupChildren({
  children,
  childrenId,
  mini,
}: Props) {
  return (
    <List
      id={childrenId}
      sx={{
        p: 0,
        mb: 0.5,
        pl: mini ? 0 : 2,
        width: mini ? 300 : undefined,
        maxWidth: "85vw",
      }}
    >
      {children}
    </List>
  );
}
