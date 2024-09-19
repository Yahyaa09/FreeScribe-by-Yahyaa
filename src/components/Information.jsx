import React, { useState, useEffect, useRef } from 'react';
import Transcription from './Transcription';
import Translation from './Translation';

export default function Information(props) {
    const { output, finished } = props;
    const [tab, setTab] = useState('transcription');
    const [translation, setTranslation] = useState(null);
    const [toLanguage, setToLanguage] = useState('Select language');
    const [translating, setTranslating] = useState(false); // Corrected initial value
    const [translatedText, setTranslatedText] = useState('');
    const worker = useRef();

    // Initialize the worker
    useEffect(() => {
        if (!worker.current) {
            worker.current = new Worker(new URL('../utils/translate.worker.js', import.meta.url), {
                type: 'module'
            });
        }

        const onMessageReceived = async (e) => {
            switch (e.data.status) {
                case 'initiate':
                    console.log('DOWNLOADING');
                    break;
                case 'progress':
                    console.log('LOADING');
                    break;
                case 'update':
                    setTranslation(e.data.output);
                    console.log(e.data.output);
                    break;
                case 'complete':
                    setTranslating(false);
                    console.log("DONE");
                    break;
                default:
                    console.log('Unknown status:', e.data.status);
            }
        };

        worker.current.addEventListener('message', onMessageReceived);

        return () => worker.current.removeEventListener('message', onMessageReceived);
    }, []);

    // Handle translation when `toLanguage` or `output` changes
    useEffect(() => {
        if (toLanguage !== 'Select language' && output.length > 0) {
            setTranslating(true);
            worker.current.postMessage({
                action: 'translate',
                text: output.map(val => val.text).join(' '),
                language: toLanguage
            });
        }
    }, [toLanguage, output]);

    const textElement = output.map(val => val.text).join(' ');

    function handleCopy() {
        if(tab==="transcription")
        {
            navigator.clipboard.writeText(textElement);
        }
        else
        {
            navigator.clipboard.writeText(translatedText);
        }
        
    }

    function handleDownload() {
        if(tab==="transcription")
        {
        const element = document.createElement("a");
        const file = new Blob([textElement], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `Freescribe_${new Date().toISOString()}.txt`; // Use ISO string for consistent formatting
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element); // Cleanup
        }
        else
        {
        const element = document.createElement("a");
        const file = new Blob([translatedText], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `Freescribe_${new Date().toISOString()}.txt`; // Use ISO string for consistent formatting
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element); // Cleanup
        } 
    }

    return (
        <main className='flex-1 p-4 flex flex-col gap-3 text-center justify-center pb-20 max-w-prose w-full mx-auto'>
            <h1 className='font-semibold text-[1.7rem] sm:text-4xl md:text-5xl whitespace-nowrap'>Your <span className='text-blue-400 bold'>Transcription</span></h1>

            <div className='grid grid-cols-2 sm:mx-auto bg-white rounded overflow-hidden items-center p-1 blueShadow border-[2px] border-solid border-blue-300'>
                <button onClick={() => setTab('transcription')} className={'px-4 rounded duration-200 py-1 ' + (tab === 'transcription' ? ' bg-blue-300 text-white' : ' text-blue-400 hover:text-blue-600')}>Transcription</button>
                <button onClick={() => setTab('translation')} className={'px-4 rounded duration-200 py-1 ' + (tab === 'translation' ? ' bg-blue-300 text-white' : ' text-blue-400 hover:text-blue-600')}>Translation</button>
            </div>
            <div className='my-4 flex flex-col-reverse max-w-prose w-full mx-auto gap-4'>
                {(!finished || translating) && (
                    <div className='grid place-items-center -mt-4'>
                        <i className="fa-solid fa-spinner animate-spin text-blue-400 text-lg"></i><p className='text-md text-blue-500'>Stay here, it works!</p> 
                    </div>
                )}
                {tab === 'transcription' ? (
                    <Transcription {...props} textElement={textElement} />
                ) : (
                    <Translation 
                       {...props} textElement={textElement} translatedText={translatedText} setTranslatedText={setTranslatedText}
                    />
                )}
            </div>
            <div className='flex items-center gap-4 mx-auto'>
                <button onClick={handleCopy} title="Copy" className='bg-white hover:text-blue-500 duration-200 text-blue-300 px-2 aspect-square grid place-items-center rounded'>
                    <i className="fa-solid fa-copy"></i>
                </button>
                <button onClick={handleDownload} title="Download" className='bg-white hover:text-blue-500 duration-200 text-blue-300 px-2 aspect-square grid place-items-center rounded'>
                    <i className="fa-solid fa-download"></i>
                </button>
            </div>
            
        </main>
    );
}
