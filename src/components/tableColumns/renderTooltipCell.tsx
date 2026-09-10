// Material UI
import Tooltip from '@mui/material/Tooltip';

export function renderTooltipCell({ value }: { value?: string }) {
    const displayValue = value || "";
    return (
        <Tooltip title={displayValue} aria-label={displayValue}>
            <div>{displayValue}</div>
        </Tooltip>
    );
}