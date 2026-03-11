"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Collapse,
  Box 
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

// Ton import spécifique next-intl
import { Link } from "@/i18n/routing"; 
import { Navigation } from "./types";

type Props = { navigation?: Navigation };

export default function DashboardNavigation({ navigation }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  if (!navigation) return null;

  const toggle = (key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <List sx={{ px: 1 }}>
      {navigation.map((item) => {
        const key = item.segment ?? item.title;
        const hasChildren = !!item.children?.length;
        
        // Chemin de base du parent (ex: /games)
        const parentPath = `/${item.segment}`;
        
        // Le parent est sélectionné si on est pile sur lui, 
        // ou sur un de ses enfants sans segment
        const isParentSelected = pathname === parentPath;

        return (
          <Box key={key} sx={{ mb: 0.5 }}>
            <ListItemButton
              component={hasChildren ? "div" : (Link as any)}
              href={hasChildren ? undefined : parentPath}
              selected={isParentSelected}
              onClick={() => hasChildren && toggle(key)}
              sx={{ 
                mx: 1, 
                borderRadius: 2,
                '&.Mui-selected': { bgcolor: 'action.selected' } 
              }}
            >
              {item.icon && <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>}
              <ListItemText primary={item.title} />
              {hasChildren && (open[key] ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>

            {hasChildren && (
              <Collapse in={open[key]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ mt: 0.5 }}>
                  {item.children!.map((child) => {
                    // Logique : si pas de segment, c'est la racine du parent
                    const childPath = child.segment 
                      ? `${parentPath}/${child.segment}` 
                      : parentPath;
                    
                    const isSelected = pathname === childPath;

                    return (
                      <ListItemButton
                        key={child.segment ?? child.title}
                        component={Link as any}
                        href={childPath}
                        selected={isSelected}
                        sx={{ 
                          pl: 4, 
                          mx: 1, 
                          mb: 0.5, 
                          borderRadius: 2,
                          '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText' }
                        }}
                      >
                        {child.icon && <ListItemIcon sx={{ minWidth: 40 }}>{child.icon}</ListItemIcon>}
                        <ListItemText primary={child.title} />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            )}
          </Box>
        );
      })}
    </List>
  );
}