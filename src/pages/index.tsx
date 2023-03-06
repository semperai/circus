import { useState } from 'react';
import { Tooltip, RangeSlider } from 'flowbite-react';
import Image from 'next/image'
import styles from '@/styles/Home.module.css'

import {
  Checkbox,
  DropDownSelector,
  ErrorPopup,
  RangeSliderTextbox,
  TagInput,
  Textbox,
} from '../components';
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import { editor, languages } from 'monaco-editor';

import { Bars3Icon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/20/solid'

import GPT3Tokenizer from 'gpt3-tokenizer';
import { Configuration, OpenAIApi } from "openai";
import { fetchEventSource } from '@microsoft/fetch-event-source';

import models from '../models.json';
import presets from '../presets.json';

const tokenizers = {
  'gpt3':  new GPT3Tokenizer({ type: 'gpt3' }),
  'codex': new GPT3Tokenizer({ type: 'codex' }),
};



export default function Home() {
  const [monacoInstance, setMonacoInstance] = useState<editor.IStandaloneCodeEditor | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [advanced, setAdvanced] = useState(! process.env.NEXT_PUBLIC_OPENAI_API_KEY || ! process.env.NEXT_PUBLIC_OPENAI_BASE_URI)
  const [loadingCompletion, setLoadingCompletion] = useState(false)

  const [errorPopupContent, setErrorPopupContent] = useState('')
  const [errorPopupOpen, setErrorPopupOpen] = useState(false)

  const [preset, setPreset] = useState(presets[0]);

  const [input, setInput] = useState('');

  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_OPENAI_API_KEY || '');
  const [basePath, setBasePath] = useState(process.env.NEXT_PUBLIC_OPENAI_BASE_URI || 'https://api.openai.com/v1');
  const [streamResponse, setStreamResponse] = useState(true);

  const [model, setModel] = useState(models[0])
  const [temperature, setTemperature] = useState(0.8);
  const [maxTokens, setMaxTokens] = useState(256);
  const [stopSequences, setStopSequences] = useState([]);
  const [topP, setTopP] = useState(1.0);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.0);
  const [presencePenalty, setPresencePenalty] = useState(0.0);
  const [startText, setStartText] = useState('');
  const [restartText, setRestartText] = useState('');

  function selectPreset(preset) {
    const conf = window.confirm('This will reset everything, are you sure?');
    if (! conf) {
      return;
    }

    for (const m of models) {
      if (m.id === preset.model) {
        setModel(m);
        break;
      }
    }
    setTemperature(preset.temperature);
    setMaxTokens(preset.max_tokens);
    setStopSequences(preset.stop_sequences);
    setTopP(preset.topP);
    setFrequencyPenalty(preset.frequency_penalty);
    setPresencePenalty(preset.presence_penalty);
    setStartText(preset.start_text);
    setRestartText(preset.restart_text);
    clearText();
    insertText(preset.input);
    setInput(preset.input);
    setPreset(preset);
  }

  function clearText() {
    if (monacoInstance === null) {
      return;
    }

    const lineCount = monacoInstance.getModel()!.getLineCount();
    const lastLineLength = monacoInstance.getModel()!.getLineMaxColumn(lineCount);
    
    monacoInstance.executeEdits('', [
      {
        range: {
          startLineNumber: 0,
          startColumn: 0,
          endLineNumber: lineCount,
          endColumn: lastLineLength,
        },
        text: null,
      }
    ])!
  }

  function insertText(text: string) {
    if (monacoInstance === null) {
      return;
    }

    const lineCount = monacoInstance.getModel()!.getLineCount();
    const lastLineLength = monacoInstance.getModel()!.getLineMaxColumn(lineCount);
    
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
    ])!
  }
  
  function editorMount(ed: editor.IStandaloneCodeEditor): OnMount {
    setMonacoInstance(ed);
  }

  async function handleSubmit() {
    async function handle_stream(body) {
      body['stream'] = true;

      return new Promise((resolve, reject) => {
        fetchEventSource(`${basePath}/completions`, {
          method: 'POST',
          headers: {
            'Accept': 'text/event-stream',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
          onopen(res) {
            if (res.ok && res.status === 200) {
              return;
            }

            if (
              res.status >= 400 &&
              res.status < 500 &&
              res.status !== 429
            ) {
              throw new Error("client side error "+ JSON.stringify(res));
            }
          },
          onmessage(evt) {
            console.debug('onmessage', evt);
            const data = evt.data;
            if (data === '[DONE]') {
              return;
            }

            const j = JSON.parse(evt.data);
            try {
              const resp: string = j.choices[0].text!;
              insertText(resp);
              setInput(input + resp);
            } catch (e) {
              console.error('onmessage_err', e);
            }
          },
          onclose() {
            console.debug('sse_close', 'connection closed by server');
            resolve();
          },
          onerror(err) {
            console.warn('sse_onerror', 'an error from server', err);
            reject();
          },
        });
      });
    }

    async function handle_sync(body) {
      const configuration = new Configuration({
        apiKey,
        basePath,
      });
      const openai = new OpenAIApi(configuration);

      const completion= await openai.createCompletion(body);

      console.debug('sync_completion', completion);
      try {
        const resp: string = completion.data.choices[0].text!;
        insertText(resp);
        setInput(input + resp);
      } catch (e) {
        console.error(e);
      }
    }

    setLoadingCompletion(true);
    try {
      const body = {
        model: model.id,
        prompt: input,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        presence_penalty: presencePenalty,
        frequency_penalty: frequencyPenalty,
      };
      // if empty array is included will barf
      if (stopSequences.length > 0) {
        body['stop'] = stopSequences.map((o) => o.id);
      }
      console.debug('request_body', body);

      if (streamResponse) {
        await handle_stream(body);
      } else {
        await handle_sync(body);
      }
    } catch(e) {
      setErrorPopupContent(JSON.stringify(e));
      setErrorPopupOpen(true);
    }
    setLoadingCompletion(false);
  }

  // used to get current input token count (bpe.length)
  const encoded: { bpe: number[]; text: string[] } = tokenizers[model.tokenizer].encode(input);

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
                  options={{
                    wordWrap: 'on',
                    quickSuggestions: false,
                  }}
                  onChange={(v: string|undefined) => { if(v) setInput(v) }}
                  />
              </div>
            </div>
          </main>
          <footer className="bg-white">
            <div className="mx-auto max-w-7xl px-6 md:flex md:items-center md:justify-between lg:px-8">
              <div className="md:order-1 md:mt-0">
                <p className="text-center text-xs leading-5 text-gray-500">
                  <a href="https://github.com/semperai/circus">open source</a>
                </p>
              </div>
            </div>
          </footer>
        </div>

        <div className={(sidebarOpen ? '' : 'hidden ') + 'fixed inset-y-0 flex w-64 flex-col'}>
          <div className="pt-10 flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <nav className="flex-1 space-y-1 px-2">

                <DropDownSelector
                  label="Presets"
                  tooltip="Choose preset"
                  choices={presets}
                  selected={preset}
                  setSelected={selectPreset}
                />

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

                <TagInput
                  label="Stop sequences"
                  tags={stopSequences}
                  setTags={setStopSequences}
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

                  <Checkbox
                    label="Stream Response"
                    tooltip="Use streaming responses as data comes in"
                    value={streamResponse}
                    setValue={setStreamResponse}
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
                    disabled={loadingCompletion || apiKey === '' || basePath === ''}
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
