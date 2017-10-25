import { mount } from 'enzyme';
import * as i18n from 'i18next';
import * as React from 'react';
import {translate, TranslationService} from '../src/index';

describe('I18n', () => {

    it('should translate if the the resource is already loaded', () => {
        // arrange
        const translationGetter = jest.fn();
        const I18n = translate({ translationGetter, namespace: 'namespace1', lang: 'ln1' });
        i18n.addResources('ln1', 'namespace1', { preloadedKey: 'translated.preloadedKey'});

        // act
        const wrapper = mount(<I18n>{t => <div>{t('preloadedKey')}</div>}</I18n>);

        // assert
        expect(wrapper.html()).toEqual('<div>translated.preloadedKey</div>');
        expect(translationGetter.mock.calls.length).toBe(0);
    });
});
