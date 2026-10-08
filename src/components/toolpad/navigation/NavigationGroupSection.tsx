import Divider from "@mui/material/Divider";
import ListSubheader from "@mui/material/ListSubheader";

interface Props {
  title: string;
  mini: boolean;
}

export default function NavigationGroupSection({ title, mini }: Props) {
  if (mini) {
    return <Divider component="li" sx={{ my: 1 }} />;
  }

  return <ListSubheader disableSticky>{title}</ListSubheader>;
}
