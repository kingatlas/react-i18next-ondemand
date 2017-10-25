// tslint:disable: no-string-literal
/// <reference path="./i18next.d.ts" />
/// <reference path="./react-i18next.d.ts" />

import * as debounce from 'debounce';
import * as reactI18next from 'react-i18next';

export interface TranslationMap {
  [key: string]: string;
}

export type TranslationGetter = (keys: string[], language: string, namespace: string) => Promise<TranslationMap>;

interface KeyQueue {
  [path: string]: KeysSet;
}
interface KeysSet {
  [key: string]: boolean;
}

export interface Options {
  /**
   * Translations getter
   * 
   * @type {TranslationGetter}
   * @memberof Options
   */
  translationGetter: TranslationGetter;
}

function attachOnDemand(i18n: i18next.i18n, translationGetter: TranslationGetter) {
  if (i18n['_onDemand']) {
    return;
  }

  i18n['_ondemand'] = true;
  const missingKeysQueue: KeyQueue = {};

  function requestResources(lng: string, ns: string) {
    const path = `${lng}.${ns}`;
    translationGetter(Object.keys(missingKeysQueue[path]), lng, ns).then((result) => {
            missingKeysQueue[path] = {};
            i18n.addResources(lng, ns, result);
      });
  }

  const debouncedRequestResources: {[path: string]: () => void } = {};
  function requestKey(key: string, lng: string, ns: string) {
    const path = `${lng}.${ns}`;
    missingKeysQueue[path] = missingKeysQueue[path] || {};
    missingKeysQueue[path][key] = true;
      
    debouncedRequestResources[path] = debouncedRequestResources[path] ||
                                      debounce(() => requestResources(lng, ns));
    debouncedRequestResources[path]();
  }

  i18n.on('missingKey', (lngs: string | string[], ns: string, key: string, res: string) => {

    const languages = typeof lngs === 'string' ? [ lngs ] : lngs;
    languages.map(l => requestKey(key, l, ns));
  });
}

export function translate(options: Options) {
    return class I18n extends reactI18next.I18n {

      /**
       * Keep track on resource keys without translation
       */
      missingKeys: { [key: string]: boolean } = {};

      constructor(props, context) {
        super(props, context);

        attachOnDemand(this.i18n, options.translationGetter);
      }

      public getI18nTranslate(): i18next.TranslationFunction {
        const originalTranslate = super.getI18nTranslate();
        const i18n = this.i18n;

        return (keys: string | string[]) => {
          const requestedKeys = typeof keys === 'string' ? [keys] : keys;
          requestedKeys.map(k => { if (!i18n.exists(k)) {
            this.missingKeys[k] = true;
          }});

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

        let needUpdate = false;
        const newMissingKeys: KeysSet = {};
        const i18n = this.i18n;

        // we check if the missings keys were translated
        Object.keys(this.missingKeys)
              .map(k => {
                    if (i18n.exists(k)) {
                      needUpdate = true;
                    } else {
                      newMissingKeys[k] = true;
                    }
                });

        this.missingKeys = newMissingKeys;

        return needUpdate;
      }
  };
}
