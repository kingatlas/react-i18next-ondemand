[![npm version](https://badge.fury.io/js/react-i18next-ondemand.svg)](https://www.npmjs.com/package/react-i18next-ondemand)

# React I18next with on demand resources 

Existing [react-i18next](https://github.com/i18next/react-i18next) does not offer a mechanism to specify async getter for translated resource keys. It supposes that the resources keys are already preloaded. This package offers an overload of the `I18n` react component that will expose the `t` translate method and load missings resource keys if needed using a defined translation asynchronous service that could be an AJAX call or any other async method.   
The use case of dynamically loaded resource keys is needed sometimes when the translations can't be generated in a static bundle and are dependend on dynamic data (current user, other settings, database).   

# Installation

```bash
# using npm
$ npm install react-i18next-ondemand

# using yarn
$ yarn add react-i18next-ondemand

```

# Who to use it?
> The `I18n` react component could be used only using the render props pattern:

- Create a module to expose the service-aware component:

```TypeScript
// i18n.ts file
import * as i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import { TranslationMap, translate } from 'react-i18next-ondemand';

// init and attach i18n to react-i18next
i18n
  .use(reactI18nextModule)
  .init({
    fallbackLng: 'en',
    ns: ['thenamespace'],
    defaultNS: 'thenamespace',
    debug: false
  });

function translationService(keys: string[]) {
      // simulate AJAX call
      return new Promise<TranslationMap>((resolve) => {
          const result: TranslationMap = {};
          keys.map(k => { result[k] = 'translation of ' + k; });
    
          setTimeout(() => {
              resolve(result);
          },         50);
      });
    }

export const I18n = translate(translationService, 'thenamespace', 'en');
```

- Use the `Ì18n` component when you need the translation method `t` at any level of your components tree:

```TypeScript
import * as React from 'react';
import { I18n } from './i18n';

export class Child extends React.Component {
    render() {
        
            return (
              <I18n>
                {
                  t => (
                      <span>
                        <span>child1</span>
                        <ul>
                          <li>{t('keytoTranslate1')}</li>
                          <li>{t('keytoTranslate2')}</li>
                        </ul>
                      </span>
                  )}
              </I18n>
            );
          }
}
```