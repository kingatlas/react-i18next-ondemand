/// <reference path="./i18next.d.ts" />
/**
 * We can't use @types/react-i18next because it does not export I18n component 
 * and depends on bad version of @types/i18next
 */

declare module 'react-i18next' {
    interface I18nState {
        i18nLoadedAt: Date;
        ready: boolean;
    }
    export class I18n extends React.Component<{}, I18nState> {
        mounted: boolean;
        t: i18next.TranslationFunction;
        getI18nTranslate();
        new(): React.Component;
    }

    export const reactI18nextModule: { type: '3rdParty', init: () => void};
}
