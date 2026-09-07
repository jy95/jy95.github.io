// https://www.npmjs.com/package/imgsearch-api has no TypeScript types, so we need to declare them ourselves. 
// This is a minimal declaration that covers the functions we use in our codebase. 
// If you need more functionality from the library, you can extend this declaration as needed.
declare module 'imgsearch-api' {
    /**
     * Image search engines supported by imgsearch-api.
     */
    export type ImageSearchEngine =
        | 'bing'
        | 'ddg'
        | 'yandex'
        | 'google';

    /**
     * Options for imageSearch().
     */
    export interface ImageSearchOptions {
        /**
         * Engines to query, in the specified order.
         *
         * Defaults to ['bing', 'ddg'].
         */
        engines?: ImageSearchEngine[];

        /**
         * Maximum number of image URLs to return.
         *
         * Defaults to 10.
         */
        n?: number;
    }

    /**
     * Options for randomImage().
     */
    export interface RandomImageOptions {
        /**
         * Engines to query.
         *
         * Defaults to ['bing', 'ddg'].
         */
        engines?: ImageSearchEngine[];
    }

    /**
     * Search for images and return direct image URLs.
     *
     * @param query Search term.
     * @param options Engines to query and maximum number of URLs to return.
     * @returns Direct image URLs.
     */
    export function imageSearch(
        query: string,
        options?: ImageSearchOptions
    ): Promise<string[]>;

    /**
     * Return a single random direct image URL for the query.
     *
     * @param query Search term.
     * @param options Engines to query.
     * @returns Direct image URL, or null if no image was found.
     */
    export function randomImage(
        query: string,
        options?: RandomImageOptions
    ): Promise<string | null>;

    /**
     * Close the browser instance used by the image search engines.
     *
     * This is useful when the application is finished with image searches
     * and the browser should no longer be kept alive.
     */
    export function closeBrowser(): Promise<void>;
}