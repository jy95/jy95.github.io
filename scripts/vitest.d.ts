// jest-dom 7 only knows how to extend vitest <= 4: its `/vitest` entrypoint
// augments `Assertion<T>`, but vitest 5 renamed that to `Assertion<R, T>`, so
// the augmentation silently stops merging. Extend vitest 5's dedicated
// `Matchers` extension point instead. To be removed once jest-dom fixes this
// See https://github.com/testing-library/jest-dom/issues/738 for more details.
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers"

declare module "vitest" {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Matchers<
        R extends void | Promise<void> = void | Promise<void>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        T = unknown,
    > extends TestingLibraryMatchers<unknown, R> {}
}