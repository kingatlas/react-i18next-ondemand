import { mount } from 'enzyme';
import * as i18n from 'i18next';
import * as React from 'react';
import { reactI18nextModule } from 'react-i18next';
import {translate, TranslationGetter} from '../src/index';
import { delay, on } from './utils';

describe('I18n', () => {
    const LANG = 'ln1';
    const NS = 'namespace1';
    let i18nInstance;

    beforeEach(() => {
        i18nInstance = i18n
        .createInstance()
        .use(reactI18nextModule)
        .init({
          fallbackLng: LANG,
          // have a common namespace used around the full app
          ns: [NS],
          defaultNS: NS,
          debug: false,
          interpolation: {
            escapeValue: false, // not needed for react!!
          }
        });
    });

    it('should translate if the the resource is already loaded', () => {
        // arrange
        const translationGetter = jest.fn();
        const I18n = translate({ translationGetter, namespace: NS, lang: LANG });
        i18nInstance.addResources(LANG, NS, { PRELOADED_KEY: 'translated.PRELOADED_KEY'});

        // act
        const wrapper = mount(<I18n>{t => <div>{t('PRELOADED_KEY')}</div>}</I18n>);

        // assert
        expect(wrapper.html()).toEqual('<div>translated.PRELOADED_KEY</div>');
        expect(translationGetter.mock.calls.length).toBe(0);
    });

    it('should load missing resource and translate', on(async () => {
        // arrange
        const translationGetter = jest.fn<TranslationGetter>();
        translationGetter.mockReturnValue(Promise.resolve({ MISSING_KEY: 'translated.MISSING_KEY' }));
        const I18n = translate({ translationGetter });

        // act
        const wrapper = mount(<I18n>{t => <div>{t('MISSING_KEY')}</div>}</I18n>);

        // assert
        expect(wrapper.html()).toEqual('<div></div>');

        // wait until the debounce is called
        await delay(100);

        expect(translationGetter.mock.calls.length).toBe(1);
        expect(translationGetter.mock.calls[0][0]).toEqual(['MISSING_KEY']);
        expect(wrapper.html()).toEqual('<div>translated.MISSING_KEY</div>');
    }));

    it('should gather missing keys request in one call', on(async () => {
        // arrange
        const translationGetter = jest.fn<TranslationGetter>();
        translationGetter.mockReturnValue(Promise.resolve({
            MISSING_KEY1: 'translated.MISSING_KEY1',
            MISSING_KEY2: 'translated.MISSING_KEY2' }));

        const I18n = translate({ translationGetter });
        
        // act
        const wrapper = mount(<I18n>{t => <div>{t('MISSING_KEY1')}{t('MISSING_KEY2')}</div>}</I18n>);

        // assert
        expect(wrapper.html()).toEqual('<div></div>');

        // wait until the debounce is called
        await delay(100);

        expect(translationGetter.mock.calls.length).toBe(1);
        expect(translationGetter.mock.calls[0][0]).toEqual(['MISSING_KEY1', 'MISSING_KEY2']);
        expect(wrapper.html()).toEqual('<div>translated.MISSING_KEY1translated.MISSING_KEY2</div>');
    }));

    it('should translate when in nested components', on(async () => {
        // arrange
        const translationGetter = jest.fn<TranslationGetter>();
        translationGetter.mockReturnValue(Promise.resolve({
            MISSING_KEY1: 'translated.MISSING_KEY1',
            MISSING_KEY2: 'translated.MISSING_KEY2' }));

        const I18n = translate({ translationGetter });
        const Child = () => <I18n>{t => <div>{t('MISSING_KEY2')}</div>}</I18n>;
        const Parent = () => <I18n>{t => <div>{t('MISSING_KEY1')}<Child/></div>}</I18n>;

        // act
        const wrapper = mount(<Parent/>);
    
        // assert
        expect(wrapper.html()).toEqual('<div><div></div></div>');

        // wait until the debounce is called
        await delay(100);

        expect(translationGetter.mock.calls.length).toBe(1);
        expect(translationGetter.mock.calls[0][0]).toEqual(['MISSING_KEY1', 'MISSING_KEY2']);
        expect(wrapper.html()).toEqual('<div>translated.MISSING_KEY1<div>translated.MISSING_KEY2</div></div>');
    }));
});
