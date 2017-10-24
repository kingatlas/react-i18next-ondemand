/// <reference path="./i18next.d.ts" />
/// <reference path="./react-i18next.d.ts" />

import * as debounce from 'debounce';
import i18n from 'i18next';
import * as reactI18next from 'react-i18next';

export interface TranslationMap {
  [key: string]: string;
}

export type TranslationService = (keys: string[]) => Promise<TranslationMap>;

interface KeysSet {
  [key: string]: boolean;
}

export function translate(translationService: TranslationService, namespace: string, lang: string) {
    const translatedKeys: TranslationMap = {};
    const missingKeys: KeysSet = {};
    function requestResources() {
      translationService(Object.keys(missingKeys)).then((result) => {
              Object.keys(result).map(k => { translatedKeys[k] = result[k]; });
              i18n.addResources(lang, namespace, result);
          });
    }

    const debouncedRequestResources = debounce(requestResources);
    function requestKey(key: string) {
        if (!translatedKeys[key]) {
          if (!missingKeys[key]) {
              missingKeys[key] = true;
              debouncedRequestResources();
          }
      }
    }

    i18n.on('missingKey', (lngs: string[], ns: string, key: string, res: string) => {
      requestKey(key);
    });

    // configure i18next
    i18n
    .use(reactI18next.reactI18nextModule)
    .init({
      fallbackLng: lang,
      // have a common namespace used around the full app
      ns: [namespace],
      defaultNS: namespace,
      debug: false,
      interpolation: {
        escapeValue: false, // not needed for react!!
      },
      react: {
        wait: true
      }
    });

    return class I18n extends reactI18next.I18n {

      /**
       * Keep track on resource keys without translation
       */
      missingKeys: { [key: string]: boolean } = {};

      public getI18nTranslate(): i18next.TranslationFunction {
        const originalTranslate = super.getI18nTranslate();
        return (keys: string | string[]) => {
          const requestedKeys = typeof keys === 'string' ? [ keys ] : keys;
          requestedKeys.map(k => { if (!translatedKeys[k]) { this.missingKeys[k] = true; }});
          return originalTranslate(keys, { defaultValue: '' });
        };
      }

      public onI18nChanged() {
        if (!this.mounted) {
          return;
        }
        if (this.needUpdateState()) {
          this.t = this.getI18nTranslate();
          this.setState({ i18nLoadedAt: new Date() });
        }
      }
      
      /**
       * return true only if some missing keys were translated
       */
      needUpdateState() {

        let newTranslatedKeys = false;
        const newMissingKeys: KeysSet = {};

        Object.keys(this.missingKeys)
              .map((k) => {
                    if (translatedKeys[k]) {
                      newTranslatedKeys = true;
                    } else {
                      newMissingKeys[k] = true;
                    }
                });

        this.missingKeys = newMissingKeys;

        return newTranslatedKeys;
      }
  };
}
