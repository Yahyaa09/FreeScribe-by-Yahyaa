import React, { useState } from 'react';
import { LANGUAGES } from '../utils/presets';

export default function Translation({ textElement ,translatedText,setTranslatedText }) {
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLanguageChange = (event) => {
        setSelectedLanguage(event.target.value);
    };

    const handleTranslate = () => {
        if (selectedLanguage && selectedLanguage !== 'Select language') {
            setLoading(true);

            // Construct the URL with proper query parameters
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textElement)}&langpair=en|${selectedLanguage}`;

            fetch(url)
                .then((res) => res.json())
                .then((data) => {
                    setTranslatedText(data.responseData.translatedText || 'No translation found');
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching translation:', error);
                    setLoading(false);
                });
        } else {
            console.log('Please select a language first');
        }
    };

    return (
        <div>
            <div className='flex flex-col gap-1 mb-4'>
                <p className='text-xs sm:text-sm font-medium text-slate-500 mr-auto'>To language</p>
                <div className='flex items-stretch gap-2 sm:gap-4'>
                    <select
                        className='flex-1 outline-none w-full focus:outline-none bg-white duration-200 p-2 rounded'
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                    >
                        <option value={'Select language'}>Select language</option>
                        {Object.entries(LANGUAGES).map(([key, value]) => {
                            return (
                                <option key={value} value={value}>{key}</option>
                            );
                        })}
                    </select>
                    <button
                        className='specialBtn px-3 py-2 rounded-lg text-blue-400 hover:text-blue-600 duration-200'
                        onClick={handleTranslate}
                    >
                        Translate
                    </button>
                </div>
            </div>
            {loading ? (
                <div className='spinner mx-auto w-full'></div>
            ) : (
                <div>
                    <p>{translatedText}</p>
                </div>
            )}
            
        </div>
    );
}
