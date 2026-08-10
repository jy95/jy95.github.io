'use client';

// Hooks
import {usePathname, useRouter} from '@/i18n/routing';
import type {Href} from '@/i18n/routing';

// Components
import { Suspense } from 'react'
import Typography from "@mui/material/Typography";
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from "@mui/material/Button";

// Types
import type { Props as CommonProps } from './types';
type UsedProps = Pick<CommonProps, "frenchLabel" | "englishLabel" | "languageTitle">
type Props = UsedProps;

// https://next-intl-docs.vercel.app/docs/routing/navigation

export default function LanguageToggle(props: Props) {
    return (
        <Suspense fallback={null}>
            <LanguageToggleInner {...props} />
        </Suspense>
    );
}

function LanguageToggleInner(props: Props) {

    const pathname = usePathname();
    const router = useRouter();

    const changeLanguage = (locale: string) => () => {
        // `usePathname()` returns the current pathname as a plain string,
        // while `router.replace` expects the strongly-typed `Href` used
        // across the routing config. This is safe: we're replacing the
        // *current*, already-resolved route with itself, only swapping the
        // locale, so `pathname` always corresponds to a valid route.
        router.replace(pathname as Href, { locale: locale });
    }

    return (
        <>
            <Typography variant="body1" gutterBottom id="settings-language">
                {props.languageTitle}
            </Typography>
            <ButtonGroup variant="outlined" aria-label={props.languageTitle}>
                <Button onClick={changeLanguage("fr")} >{props.frenchLabel}</Button>
                <Button onClick={changeLanguage("en")} >{props.englishLabel}</Button>
            </ButtonGroup>
        </>
    );
}