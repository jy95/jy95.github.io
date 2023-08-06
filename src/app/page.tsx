"use client";

// Nextjs
import {redirect} from 'next/navigation';

// Redirect the user to the default locale when the app root is requested
// https://next-intl-docs.vercel.app/docs/routing/middleware#usage-without-middleware-static-export
export default function RootPage() {
    redirect('/fr/games');
}