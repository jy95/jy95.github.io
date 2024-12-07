'use client';

// Hooks
import {usePathname, useRouter} from '@/i18n/routing';

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
        router.replace(
            // @ts-expect-error -- TypeScript will validate that only known `params`
            // are used in combination with a given `pathname`. Since the two will
            // always match for the current route, we can skip runtime checks.
            pathname, 
            { locale: locale }
        );
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