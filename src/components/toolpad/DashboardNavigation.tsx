"use client";

import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse
} from "@mui/material";

import { useState } from "react";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { Navigation } from "./types";

type Props = {
  navigation?: Navigation;
};

export default function DashboardNavigation({ navigation }: Props) {

  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!navigation) return null;

  return (
    <List>

      {navigation.map((item) => {

        const key = item.segment ?? item.title;
        const hasChildren = !!item.children?.length;

        return (
          <div key={key}>

            <ListItemButton
              onClick={() => hasChildren && toggle(key)}
            >
              {item.icon && (
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
              )}

              <ListItemText primary={item.title} />

              {hasChildren && (
                open[key] ? <ExpandLess /> : <ExpandMore />
              )}
            </ListItemButton>

            {hasChildren && (
              <Collapse in={open[key]}>

                <List component="div" disablePadding>

                  {item.children!.map((child) => (
                    <ListItemButton
                      key={child.segment ?? child.title}
                      sx={{ pl: 4 }}
                    >
                      {child.icon && (
                        <ListItemIcon>
                          {child.icon}
                        </ListItemIcon>
                      )}

                      <ListItemText primary={child.title} />
                    </ListItemButton>
                  ))}

                </List>

              </Collapse>
            )}

          </div>
        );
      })}

    </List>
  );
}