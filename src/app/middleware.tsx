import { NextResponse } from 'next/server'
import { fallbackLng, languages } from '@/i18n/settings'
import type { NextRequest } from 'next/server'
import type { languagesValues } from "@/i18n/settings";

export const config = {
    // matcher: '/:lng*'
    matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)']
}

const cookieName = 'i18next'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {

    let lng : languagesValues | undefined;
    // TODO, better detect provided language
    if (!lng) lng = fallbackLng

    // Redirect if lng in path is not supported
    if (
        !languages.some(loc => request.nextUrl.pathname.startsWith(`/${loc}`)) &&
        !request.nextUrl.pathname.startsWith('/_next')
    ) {
        return NextResponse.redirect(new URL(`/${lng}${request.nextUrl.pathname}`, request.url))
    }

    // Use referer
    if (request.headers.has('referer')) {
        const refererUrl = new URL(request.headers.get('referer')!)
        const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`))
        const response = NextResponse.next()
        if (lngInReferer) response.cookies.set(cookieName, lngInReferer)
        return response
    }

    return NextResponse.next();
}