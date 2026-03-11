"use client";

import { useState } from "react";
import { usePathname } from "@/i18n/routing"; 
import { Box, Collapse, List } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import NavigationItem from "./NavigationItem";

import type { NavigationItem as Item } from "../types";

function hasChildren(item: Item): item is Item & { children: Item[] } {
  return !!item.children?.length;
}

export default function NavigationGroup({ item }: { item: Item }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  
  const hasAnyChild = hasChildren(item);
  const parentPath = `/${item.segment}`;
  
  // La comparaison devient nativement correcte car pathname et parentPath 
  // utilisent la même logique de résolution fournie par next-intl
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