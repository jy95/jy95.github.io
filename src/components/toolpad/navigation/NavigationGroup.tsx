"use client";  
  
// React / Next.js / third-party libraries  
import { useTranslations } from "next-intl";  
  
import Box from "@mui/material/Box";  
import Collapse from "@mui/material/Collapse";  
import List from "@mui/material/List";  
import ListItem from "@mui/material/ListItem";  
import ListItemButton from "@mui/material/ListItemButton";  
import ListItemIcon from "@mui/material/ListItemIcon";  
import ListItemText from "@mui/material/ListItemText";  
  
// Project utilities and shared modules (@/)  
import { useToggle } from "@/hooks/useToggle";  
import { Link, usePathname } from "@/i18n/routing";  
import type { Href } from "@/i18n/routing";  
  
// Navigation feature  
import NavigationItem from "./NavigationItem";  
import { popoverListItemButtonSx } from "./navigationStyles";  
import { useAppContext } from "../provider/useAppContext";  
import type { NavigationItem as Item } from "../types";  
  
function hasChildren(item: Item): item is Item & { children: Item[] } {  
  return !!item.children?.length;  
}  
  
/** Joins a child segment onto its parent path (segmentless items keep it). */  
function childPath(child: Item, itemPath: string): string {  
  return child.segment ? `${itemPath}/${child.segment}` : itemPath;  
}  
  
function childKey(child: Item, idx: number): string {  
  return `${child.segment ?? child.titleKey}-${idx}`;  
}  
  
interface PopoverRowProps {  
  child: Item;  
  path: Href;  
  selected: boolean;  
  title: string;  
}  
  
function PopoverRow({ child, path, selected, title }: PopoverRowProps) {  
  return (  
    <ListItem sx={{ py: 0, px: 1 }}>  
      <ListItemButton  
        component={Link}  
        href={path}  
        selected={selected}  
        sx={{ ...popoverListItemButtonSx, px: 1.4, height: 48 }}  
      >  
        <Box sx={{ display: "flex" }}>  
          <ListItemIcon  
            sx={{  
              display: "flex",  
              alignItems: "center",  
              justifyContent: "center",  
              minWidth: 34,  
            }}  
          >  
            {child.icon ?? null}  
          </ListItemIcon>  
        </Box>  
        <ListItemText  
          primary={title}  
          sx={{ ml: 1.2, whiteSpace: "nowrap" }}  
        />  
      </ListItemButton>  
    </ListItem>  
  );  
}  
  
interface MiniPopoverProps {  
  children: Item[];  
  itemPath: string;  
  pathname: string;  
}  
  
/** Popover children rendered in full expanded style matching Toolpad's DOM. */  
function MiniPopover({ children, itemPath, pathname }: MiniPopoverProps) {  
  const t = useTranslations("dashboard.menuEntries");  
  
  return (  
    <List sx={{ padding: 0, minWidth: 200 }}>  
      {children.map((child, idx) => {  
        const path = childPath(child, itemPath);  
        return (  
          <PopoverRow  
            key={childKey(child, idx)}  
            child={child}  
            // `path` is built by concatenating route segments at runtime, so  
            // it can't be statically checked against the finite  
            // `routing.pathnames` union — it's still guaranteed valid because  
            // it's derived from the same segment strings routes use.  
            path={path as Href}  
            selected={pathname === path}  
            title={t(child.titleKey)}  
          />  
        );  
      })}  
    </List>  
  );  
}  
  
interface Props {  
  item: Item;  
  parentPath?: string;  
  depth?: number;  
}  
  
export default function NavigationGroup({  
  item,  
  parentPath = "",  
  depth = 0,  
}: Props) {  
  const pathname = usePathname();  
  const { drawerOpen = true } = useAppContext();  
  const isMini = !drawerOpen;  
  // Resolves `titleKey` (e.g. "gamesTabs.grid") into display text. Doing  
  // this here — at render time, per navigation node — is what lets  
  // `MenuEntries.tsx` build a static, translation-agnostic tree instead of  
  // taking ~11 pre-translated string props from its caller.  
  const t = useTranslations("dashboard.menuEntries");  
  
  const itemPath = childPath(item, parentPath);  
  const hasAnyChild = hasChildren(item);  
  const isCollapsible = hasAnyChild && !isMini;  
  
  const isAnyChildSelected =  
    hasAnyChild &&  
    item.children.some((child) => {  
      const path = childPath(child, itemPath);  
      return pathname === path || pathname.startsWith(`${path}/`);  
    });  
  
  const [open, toggleOpen] = useToggle(isAnyChildSelected);  
  
  // In mini mode highlight parent when any child is active; in expanded mode  
  // only leaf items are highlighted.  
  const isSelected = hasAnyChild  
    ? isMini && isAnyChildSelected  
    : pathname === itemPath;  
  
  return (  
    <>  
      <NavigationItem  
        title={t(item.titleKey)}  
        icon={item.icon}  
        href={isCollapsible ? undefined : itemPath}  
        selected={isSelected}  
        onClick={isCollapsible ? toggleOpen : undefined}  
        expanded={open}  
        hasChildren={hasAnyChild}  
        miniPopoverContent={  
          hasAnyChild && isMini ? (  
            <MiniPopover  
              children={item.children}  
              itemPath={itemPath}  
              pathname={pathname}  
            />  
          ) : undefined  
        }  
      />  
  
      {isCollapsible ? (  
        <Collapse in={open} timeout="auto" unmountOnExit>  
          <List sx={{ padding: 0, mb: 0.5, pl: 2 * (depth + 1) }}>  
            {item.children.map((child, idx) => (  
              <NavigationGroup  
                key={childKey(child, idx)}  
                item={child}  
                parentPath={itemPath}  
                depth={depth + 1}  
              />  
            ))}  
          </List>  
        </Collapse>  
      ) : null}  
    </>  
  );  
}
