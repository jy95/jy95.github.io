"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Box, Collapse, List } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import NavigationItem from "./NavigationItem";

// Types
import type { NavigationItem as Item } from "../types";

function hasChildren(item: Item): item is Item & { children: Item[] } {
  return !!item.children?.length;
}

export default function NavigationGroup({ item }: { item: Item }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  
  const key = item.segment ?? item.title;
  const hasAnyChild = hasChildren(item);
  const parentPath = `/${item.segment}`;
  const isParentSelected = pathname === parentPath;

  return (
    <Box sx={{ mb: 0.5 }}>
      <NavigationItem
        title={item.title}
        icon={item.icon}
        href={hasAnyChild ? undefined : parentPath}
        selected={isParentSelected}
        onClickAction={() => hasAnyChild && setOpen(!open)}
        endIcon={hasAnyChild ? (open ? <ExpandLess /> : <ExpandMore />) : undefined}
      />

      {hasAnyChild && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ mt: 0.5 }}>
            {item.children.map((child: any) => {
              const childPath = child.segment ? `${parentPath}/${child.segment}` : parentPath;
              return (
                <NavigationItem
                  key={child.segment ?? child.title}
                  title={child.title}
                  icon={child.icon}
                  href={childPath}
                  selected={pathname === childPath}
                  isChild
                />
              );
            })}
          </List>
        </Collapse>
      )}
    </Box>
  );
}