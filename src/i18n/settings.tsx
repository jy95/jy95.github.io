export const fallbackLng = 'fr'
export const languages = [fallbackLng, 'en'] as const
export type languagesValues = typeof languages[number]
export const defaultNS = 'common'

export function getOptions (lng = fallbackLng, ns = defaultNS) {
    return {
      // debug: true,
      supportedLngs: languages,
      fallbackLng,
      lng,
      fallbackNS: defaultNS,
      defaultNS,
      ns
    }
}
