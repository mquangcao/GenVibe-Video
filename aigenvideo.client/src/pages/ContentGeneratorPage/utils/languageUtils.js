export const getLanguageDisplayName = (langCode) => {
    const languageMap = {
        en: 'English',
        es: 'Spanish',
        fr: 'French',
        de: 'German',
        it: 'Italian',
        pt: 'Portuguese',
        ru: 'Russian',
        ja: 'Japanese',
        ko: 'Korean',
        zh: 'Chinese',
        ar: 'Arabic',
        hi: 'Hindi',
        nl: 'Dutch',
        pl: 'Polish',
        tr: 'Turkish',
        sv: 'Swedish',
        no: 'Norwegian',
        da: 'Danish',
        fi: 'Finnish',
        th: 'Thai',
        vi: 'Vietnamese',
        id: 'Indonesian',
        cs: 'Czech',
        hu: 'Hungarian',
        el: 'Greek',
        he: 'Hebrew',
    };

    const countryMap = {
        US: 'United States',
        GB: 'United Kingdom',
        CA: 'Canada',
        AU: 'Australia',
        IN: 'India',
        ES: 'Spain',
        MX: 'Mexico',
        FR: 'France',
        DE: 'Germany',
        IT: 'Italy',
        BR: 'Brazil',
        PT: 'Portugal',
        RU: 'Russia',
        JP: 'Japan',
        KR: 'Korea',
        CN: 'China',
        TW: 'Taiwan',
        HK: 'Hong Kong',
        AR: 'Argentina',
        SA: 'Saudi Arabia',
        NL: 'Netherlands',
        BE: 'Belgium',
        CH: 'Switzerland',
        AT: 'Austria',
        SE: 'Sweden',
        NO: 'Norway',
        DK: 'Denmark',
        FI: 'Finland',
        PL: 'Poland',
        TR: 'Turkey',
    };

    try {
        const [langPart, countryPart] = langCode.split('-');
        const language = languageMap[langPart] || langPart;
        const country = countryPart ? countryMap[countryPart.toUpperCase()] || countryPart : '';

        return country ? `${language} - ${country}` : language;
    } catch (e) {
        console.error('Error parsing language code:', e);
        return langCode;
    }
};