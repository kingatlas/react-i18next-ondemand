declare namespace i18next {

    interface FallbackLngObjList {
        [language: string]: string[];
    }

    type FallbackLng = string | string[] | FallbackLngObjList;

    type FormatFunction = (value: string, format?: string, lng?: string) => string;

    interface InterpolationOptions {
        /**
         *  format function see formatting for details
         * @default noop
         */
        format?: FormatFunction;
        /**
         * 	used to separate format from interpolation value
         * @default ','
         */
        formatSeparator?: string;
        /**
         * 	escape function
         * @default str => str
         */
        escape?(str: string): string;

        /**
         * 	escape passed in values to avoid xss injection
         * @default true
         */
        escapeValue?: boolean;
        /**
         * 	prefix for interpolation
         * @default '{{'
         */
        prefix?: string;
        /**
         * 	suffix for interpolation
         * @default '}}'
         */
        suffix?: string;
        /**
         * 	escaped prefix for interpolation (regexSafe)
         * @default undefined
         */
        prefixEscaped?: string;
        /**
         * 	escaped suffix for interpolation (regexSafe)
         * @default undefined
         */
        suffixEscaped?: string;
        /**
         * 	suffix to unescaped mode
         * @default undefined
         */
        unescapeSuffix?: string;
        /**
         * 	prefix to unescaped mode
         * @default '-'
         */
        unescapePrefix?: string;
        /**
         * prefix for nesting
         * @default '$t('
         */
        nestingPrefix?: string;
        /**
         * 	suffix for nesting
         * @default ')'
         */
        nestingSuffix?: string;
        /**
         * 	escaped prefix for nesting (regexSafe)
         * @default undefined
         */
        nestingPrefixEscaped?: string;
        /**
         * 	escaped suffix for nesting (regexSafe)
         * @default undefined
         */
        nestingSuffixEscaped?: string;
        /**
         * 	global variables to use in interpolation replacements
         * @default undefined
         */
        defaultVariables?: any;
    }

    interface TranslationOptionsBase {
        /**
         * defaultValue to return if a translation was not found
         */
        defaultValue?: any;
        /**
         * count value used for plurals
         */
        count?: number;
        /**
         * used for contexts (eg. male\female)
         */
        context?: any;
        /**
         * object with vars for interpolation - or put them directly in options
         */
        replace?: any;
        /**
         * override language to use
         */
        lng?: string;
        /**
         * override languages to use
         */
        lngs?: string[];
        /**
         * override language to lookup key if not found see fallbacks for details
         */
        fallbackLng?: FallbackLng;
        /**
         * override namespaces (string or array)
         */
        ns?: string | string[];
        /**
         * override char to separate keys
         */
        keySeparator?: string;
        /**
         * override char to split namespace from key
         */
        nsSeparator?: string;
        /**
         * accessing an object not a translation string (can be set globally too)
         */
        returnObjects?: boolean;
        /**
         * char, eg. '\n' that arrays will be joined by (can be set globally too)
         */
        joinArrays?: string;
        /**
         * string or array of postProcessors to apply see interval plurals as a sample
         */
        postProcess?: string | string[];
        /**
         * override interpolation options
         */
        interpolation?: InterpolationOptions;
    }

    type TranslationOptions<TCustomOptions extends object = object> = TranslationOptionsBase & TCustomOptions & { [key: string]: any };

    type TranslationFunction<TResult = any, TValues extends object = object, TKeys extends string = string> =
    (key: TKeys | TKeys[], options?: TranslationOptions<TValues>) => TResult;
}