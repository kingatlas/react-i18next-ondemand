/// <reference path="./i18next.d.ts" />

declare module 'react-i18next' {
    interface I18nState {
        i18nLoadedAt: Date;
        ready: boolean;
    }
    export class I18n extends React.Component<{}, I18nState> {
        new(): React.Component;
        mounted: boolean;
        t: i18next.TranslationFunction;
        getI18nTranslate();

    }

    export const reactI18nextModule: { type: '3rdParty', init: ()=> void};
}