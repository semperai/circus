import { useState } from 'react';
import { Tooltip, RangeSlider } from 'flowbite-react';
import Image from 'next/image'
import styles from '@/styles/Home.module.css'

import {
  Editor,
  ErrorPopup,
  RangeSliderTextbox,
  DropDownSelector
} from '../components';

import { Bars3Icon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/20/solid'

import { Configuration, OpenAIApi } from "openai";

const models = [
  { id: 'text-davinci-003', name: 'text-davinci-003' },
]


const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [errorPopupContent, setErrorPopupContent] = useState('')
  const [errorPopupOpen, setErrorPopupOpen] = useState(false)

  const [input, setInput] = useState('');
  const [model, setModel] = useState(models[0])
  const [temperature, setTemperature] = useState(0.8);
  const [maxTokens, setMaxTokens] = useState(256);
  const [topP, setTopP] = useState(1.0);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.0);
  const [presencePenalty, setPresencePenalty] = useState(0.0);
  const [startText, setStartText] = useState('');
  const [restartText, setRestartText] = useState('');

  async function handleSubmit() {
	let completion;
    const req = {
      model: model.id,
      prompt: input,
      temperature,
	  max_tokens: maxTokens,
      top_p: topP,
      presence_penalty: presencePenalty,
      frequency_penalty: frequencyPenalty,
    };
    console.log(req);
	try {
      completion = await openai.createCompletion(req);
	} catch (e) {
      setErrorPopupContent(JSON.stringify(e));
      setErrorPopupOpen(true);
	  return;
	}

	console.log(completion);
    const resp = completion.data.choices[0].text;
    setInput(input + resp);
  }

  return (
    <>
      <ErrorPopup
        title="An error occurred…"
        content={errorPopupContent}
        open={errorPopupOpen}
        setOpen={setErrorPopupOpen}
        />
      <div>
        <div className="flex flex-1 flex-col lg:pl-64">
          <div className="sticky top-0 z-10 bg-gray-100 pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <main className="flex-1 bg-white">
            <div className="py-6">
              <div className="mx-auto max-w px-4 sm:px-6 lg:px-8">
                <Editor
                   placeholder="Type an input…"
                   value={input}
                   onValueChange={(content) => setInput(content)}
                   highlight={(content) => /* highlight(code, languages.jsx!, 'jsx')*/ content}
                   padding={0}
                   className="container__editor h-screen overflow-y-auto"
                 />
			  </div>
            </div>
          </main>
        </div>


        <div className="fixed inset-y-0 flex w-64 flex-col">
          <div className={(sidebarOpen ? '' : 'hidden ') + 'pt-10 flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white'}>
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <nav className="flex-1 space-y-1 px-2">

                <DropDownSelector
				  label="Model"
                  tooltip="Bigger models better"
				  choices={models}
                  selected={model}
                  setSelected={setModel}
                />

                <RangeSliderTextbox
                  label="Temperature"
                  tooltip="How wild"
                  min={0.0}
                  max={1.0}
                  step={0.01}
                  value={temperature}
                  setValue={setTemperature}
                />

                <RangeSliderTextbox
                  label="Maximum Length"
                  tooltip="Maximum amount of tokens"
                  min={0}
                  max={2048}
                  step={1}
                  value={maxTokens}
                  setValue={setMaxTokens}
                />

                <RangeSliderTextbox
                  label="Top P"
                  tooltip="Control diversity"
                  min={0.0}
                  max={1.0}
                  step={0.01}
                  value={topP}
                  setValue={setTopP}
                />

                <RangeSliderTextbox
                  label="Frequency Penalty"
                  tooltip=""
                  min={0.0}
                  max={2.0}
                  step={0.01}
                  value={frequencyPenalty}
                  setValue={setFrequencyPenalty}
                />

                <RangeSliderTextbox
                  label="Presence Penalty"
                  tooltip=""
                  min={0.0}
                  max={2.0}
                  step={0.01}
                  value={presencePenalty}
                  setValue={setPresencePenalty}
                />
              </nav>
            </div>
		  </div>

          <div className="flex flex-shrink-0 border-t border-r border-gray-200 p-4 bg-white">
            <a href="#" className="group block w-full flex-shrink-0">
              <div className="flex items-center">
                <div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 py-1.5 px-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					onClick={handleSubmit}
                  >
                    Submit
                    <CheckCircleIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="ml-3">
		  		{/*TODO show token count here*/}
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
