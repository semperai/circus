import { useState } from 'react';
import { Tooltip, RangeSlider } from 'flowbite-react';
import Image from 'next/image'
import styles from '@/styles/Home.module.css'

import {
  Checkbox,
  DropDownSelector,
  ErrorPopup,
  RangeSliderTextbox,
  Textbox,
} from '../components';
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import { editor, languages } from 'monaco-editor';

import { Bars3Icon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/20/solid'

import GPT3Tokenizer from 'gpt3-tokenizer';
import { Configuration, OpenAIApi } from "openai";

const gpt3Tokenizer = new GPT3Tokenizer({ type: 'gpt3' });
const codexTokenizer = new GPT3Tokenizer({ type: 'codex' });

const models = [
  {id: 'text-davinci-003', name: 'text-davinci-003', max_tokens: 4096, tokenizer: gpt3Tokenizer },
  {id: 'text-curie-001',   name: 'text-curie-001',   max_tokens: 2048, tokenizer: gpt3Tokenizer },
  {id: 'text-babbage-001', name: 'text-babbage-001', max_tokens: 2048, tokenizer: gpt3Tokenizer },
  {id: 'text-ada-001',     name: 'text-ada-001',     max_tokens: 2048, tokenizer: gpt3Tokenizer },
  {id: 'code-davinci-002', name: 'code-davinci-002', max_tokens: 4096, tokenizer: codexTokenizer },
  {id: 'code-cushman-001', name: 'text-cushman-001', max_tokens: 2048, tokenizer: codexTokenizer },
];

export default function Home() {
  const [monacoInstance, setMonacoInstance] = useState<editor.IStandaloneCodeEditor | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [advanced, setAdvanced] = useState(process.env.NEXT_PUBLIC_OPENAI_API_KEY === '' || process.env.NEXT_PUBLIC_OPENAI_BASE_URI === '')
  const [submitDisabled, setSubmitDisabled] = useState(false)

  const [errorPopupContent, setErrorPopupContent] = useState('')
  const [errorPopupOpen, setErrorPopupOpen] = useState(false)

  const [input, setInput] = useState('');

  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_OPENAI_API_KEY);
  const [basePath, setBasePath] = useState(process.env.NEXT_PUBLIC_OPENAI_BASE_URI || 'https://api.openai.com/v1');

  const [model, setModel] = useState(models[0])
  const [temperature, setTemperature] = useState(0.8);
  const [maxTokens, setMaxTokens] = useState(256);
  const [topP, setTopP] = useState(1.0);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.0);
  const [presencePenalty, setPresencePenalty] = useState(0.0);
  const [startText, setStartText] = useState('');
  const [restartText, setRestartText] = useState('');

  const insertText = (text: string) => {
    if (! monacoInstance) {
      return;
    }

    const lineCount = monacoInstance.getModel().getLineCount();
    const lastLineLength = monacoInstance.getModel().getLineMaxColumn(lineCount);
    
    const range = new Range(
        lineCount,
        lastLineLength,
        lineCount,
        lastLineLength
    );
    
    monacoInstance.executeEdits('', [
      {
        range: {
          startLineNumber: lineCount,
          startColumn: lastLineLength,
          endLineNumber: lineCount,
          endColumn: lastLineLength,
        },
        text,
      }
    ])
  };
  
  const editorMount: OnMount = (editorL: editor.IStandaloneCodeEditor) => {
      setMonacoInstance(editorL);
  };


  async function handleSubmit() {
    async function handle() {
      const configuration = new Configuration({
        apiKey,
        basePath,
      });
      const openai = new OpenAIApi(configuration);

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
      insertText(resp);
      setInput(input + resp);
    }

    setSubmitDisabled(true);
    try {
      await handle();
    } catch(e) {}
    setSubmitDisabled(false);
  }

  const encoded: { bpe: number[]; text: string[] } = model.tokenizer.encode(input);

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
              <div className="mx-auto max-w max-h-screen">
                <Editor
                  onMount={editorMount}
                  height="90vh"
                  defaultLanguage="plaintext"
                  defaultValue={input}
                  onChange={(v) => setInput(v)}
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
                  label="Max Tokens"
                  tooltip="Maximum amount of tokens"
                  min={0}
                  max={model.max_tokens}
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

                <Checkbox
                  label="Advanced Settings"
                  tooltip="Show api and base uri settings"
                  value={advanced}
                  setValue={setAdvanced}
                  />
                <div className={(advanced) ? '' : 'hidden'}>
                  <Textbox
                    label="API Key"
                    tooltip=""
                    value={apiKey}
                    setValue={setApiKey}
                  />

                  <Textbox
                    label="Base URI"
                    tooltip="Should look like: https://api.openai.com/v1"
                    value={basePath}
                    setValue={setBasePath}
                  />
                </div>
              </nav>
            </div>
          </div>

          <div className="flex flex-shrink-0 border-t border-r border-gray-200 p-4 bg-white">
            <a href="#" className="group block w-full flex-shrink-0">
              <div className="flex items-stretch justify-between">
                <div className="ml-3 bg-slate-200 p-1 pl-4 pr-4 rounded-md">
                  {encoded.bpe.length}
                </div>
                <div className="ml-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 py-1.5 px-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-25"
                    disabled={submitDisabled}
                    onClick={handleSubmit}
                  >
                    Submit
                    <CheckCircleIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
