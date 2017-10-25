/// <reference path="./i18next.d.ts" />
/// <reference path="./react-i18next.d.ts" />

import * as debounce from 'debounce';
import * as reactI18next from 'react-i18next';

export interface TranslationMap {
  [key: string]: string;
}

export type TranslationService = (keys: string[]) => Promise<TranslationMap>;

interface KeysSet {
  [key: string]: boolean;
}

export interface Options {
  /**
   * Translations getter
   * 
   * @type {TranslationService}
   * @memberof Options
   */
  translationGetter: TranslationService;

  /**
   * Namespace to use when adding missing translation
   * 
   * @type {string}
   * @memberof Options
   */
  namespace: string;

  /**
   * Language to use when adding missing translation
   * 
   * @type {string}
   * @memberof Options
   */
  lang: string;
}

export function translate(options: Options) {
    const translationGetter = options.translationGetter;
    const namespace = options.namespace;
    const lang = options.lang;
    const translatedKeys: TranslationMap = {};
    const missingKeys: KeysSet = {};

    return class I18n extends reactI18next.I18n {

      /**
       * Keep track on resource keys without translation
       */
      missingKeys: { [key: string]: boolean } = {};

      constructor(props, context) {
        super(props, context);

        const i18n = this.i18n;

        function requestResources() {
          translationGetter(Object.keys(missingKeys)).then((result) => {
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
      }

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
              .map(k => {
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
