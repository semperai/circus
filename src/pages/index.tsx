import { useEffect, useState } from 'react';
import { Tooltip } from 'flowbite-react';

import {
  Checkbox,
  DropDownSelector,
  ErrorPopup,
  RangeSliderTextbox,
  MarkdownRender,
  TagInput,
  Textbox,
} from '../components';
import Editor from "@monaco-editor/react";
import { editor } from 'monaco-editor';

import { Bars3Icon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/20/solid'

import GPT3Tokenizer from 'gpt3-tokenizer';
import { Configuration, OpenAIApi } from "openai";
import { fetchEventSource } from '@microsoft/fetch-event-source';

import models from '../models.json';
import presets from '../presets.json';

interface Preset {
  id: string;
  name: string;
  model: string;
  temperature: number;
  max_tokens: number;
  stop_sequences: string[];
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  start_text: string;
  restart_text: string;
  input: string;
};

const tokenizers: { [key: string]: any } = {
  'gpt3':  new GPT3Tokenizer({ type: 'gpt3' }),
  'codex': new GPT3Tokenizer({ type: 'codex' }),
};

export default function Home() {
  const [monacoInstance, setMonacoInstance] = useState<editor.IStandaloneCodeEditor | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showMarkdown, setShowMarkdown] = useState(false)
  const [showCurl, setShowCurl] = useState(false)
  const [advanced, setAdvanced] = useState(! process.env.NEXT_PUBLIC_OPENAI_API_KEY || ! process.env.NEXT_PUBLIC_OPENAI_BASE_URI)
  const [loadingCompletion, setLoadingCompletion] = useState(false)

  const [errorPopupContent, setErrorPopupContent] = useState('')
  const [errorPopupOpen, setErrorPopupOpen] = useState(false)

  const [preset, setPreset] = useState(presets[0] as Preset);

  const [input, setInput] = useState('');

  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_OPENAI_API_KEY || '');
  const [basePath, setBasePath] = useState(process.env.NEXT_PUBLIC_OPENAI_BASE_URI || 'https://api.openai.com/v1');
  const [streamResponse, setStreamResponse] = useState(true);

  const [model, setModel] = useState(models[0])
  const [temperature, setTemperature] = useState(0.8);
  const [maxTokens, setMaxTokens] = useState(256);
  const [stopSequences, setStopSequences] = useState([] as string[]);
  const [topP, setTopP] = useState(1.0);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.0);
  const [presencePenalty, setPresencePenalty] = useState(0.0);
  const [startText, setStartText] = useState('');
  const [restartText, setRestartText] = useState('');

  useEffect(() => {
    function keyHandler() {
      // hack to keep input and monaco in sync
      setTimeout(() => {
        if (monacoInstance !== null) {
          setInput(monacoInstance.getValue());
        }
      }, 0);
    }

    document.addEventListener("keydown", keyHandler, true);

    return () => {
      document.removeEventListener("keydown", keyHandler, true);
    };
  }, [monacoInstance]);


  function selectPreset(preset: Preset) {
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
    setTopP(preset.top_p);
    setFrequencyPenalty(preset.frequency_penalty);
    setPresencePenalty(preset.presence_penalty);
    setStartText(preset.start_text);
    setRestartText(preset.restart_text);
    clearText();
    insertText(preset.input);
    setInput(preset.input);
    setPreset(preset);
  }

  function editorOnChange(v: string|undefined) {
    if(v) {
      setInput(v);
    }
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
  
  function editorMount(ed: editor.IStandaloneCodeEditor) {
    setMonacoInstance(ed);
  }

  async function handleSubmit() {
    async function handle_stream(body: any) {
      return new Promise<void>((resolve, reject) => {
        fetchEventSource(`${basePath}/completions`, {
          method: 'POST',
          headers: {
            'Accept': 'text/event-stream',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
          async onopen(res) {
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
              // hack to keep input and monaco in sync
              if (monacoInstance !== null) {
                insertText(restartText);
                setInput(monacoInstance.getValue());
              }
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

    async function handle_sync(body: any) {
      const configuration = new Configuration({
        apiKey,
        basePath,
      });
      const openai = new OpenAIApi(configuration);

      const completion= await openai.createCompletion(body);

      console.debug('sync_completion', completion);
      try {
        const resp: string = completion.data.choices[0].text!;
        insertText(resp + restartText);
        setInput(input + resp + restartText);
      } catch (e) {
        console.error(e);
      }
    }

    setLoadingCompletion(true);
    insertText(startText);
    setInput(input + startText);
    try {
      const body = {
        model: model.id,
        prompt: input,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        presence_penalty: presencePenalty,
        frequency_penalty: frequencyPenalty,
        stream: streamResponse,
        // if empty array is included will barf
        stop: stopSequences.length > 0 ? stopSequences : undefined,
      };

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
            <div className="flex-col">
            </div>
            <div className={(showCurl ? '' : 'hidden ') + 'mx-auto pl-10 pr-10 pt-2 pb-2 bg-slate-600 text-white'}>
              <code className="text-white text-sm">
                curl {basePath}/completions
                -H 'Content-Type: application/json'
                -H 'Authorization: Bearer {apiKey}'
                -d '{JSON.stringify({model: model.id, prompt: input, max_tokens: maxTokens, temperature, top_p: topP, presence_penalty: presencePenalty, frequency_penalty: frequencyPenalty, stream: streamResponse, stop: stopSequences.length > 0 ? stopSequences : undefined})}'
              </code>
            </div>
            <div className={(showMarkdown ? '' : 'hidden ') + 'mx-auto pl-10 pr-10 pt-2 pb-2 bg-slate-100'}>
              { /* eslint-disable-next-line react/no-children-prop */ }
              <MarkdownRender children={input} />
            </div>
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
                    renderLineHighlight: 'none',
                    lineNumbers: 'off',
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 0,
                    minimap: {enabled: false},
                  }}
                  onChange={editorOnChange}
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

                <Checkbox
                  label="Show Markdown Panel"
                  tooltip="Show api and base uri settings"
                  value={showMarkdown}
                  setValue={setShowMarkdown}
                />

                <Checkbox
                  label="Show cURL"
                  tooltip="Show cURL command"
                  value={showCurl}
                  setValue={setShowCurl}
                />

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
                  tooltip="Maximum amount of tokens. Includes input tokens."
                  min={0}
                  max={model.max_tokens}
                  step={1}
                  value={maxTokens}
                  setValue={setMaxTokens}
                />

                <TagInput
                  label="Stop sequences"
                  tooltip="Stop completion if one of these sequences is reached. Up to 4 allowed."
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
                  tooltip="How much to penalize tokens based on their frequency in the input so far."
                  min={0.0}
                  max={2.0}
                  step={0.01}
                  value={frequencyPenalty}
                  setValue={setFrequencyPenalty}
                />

                <RangeSliderTextbox
                  label="Presence Penalty"
                  tooltip="How much to penalize tokens if they have already been in the input so far."
                  min={0.0}
                  max={2.0}
                  step={0.01}
                  value={presencePenalty}
                  setValue={setPresencePenalty}
                />

                <Textbox
                  label="Start Text"
                  tooltip="Text to append after your input"
                  value={startText}
                  setValue={setStartText}
                />

                <Textbox
                  label="Restart Text"
                  tooltip="Text to append after models response"
                  value={restartText}
                  setValue={setRestartText}
                />

                <Checkbox
                  label="Advanced Settings"
                  tooltip="Show connection details and other tweaks."
                  value={advanced}
                  setValue={setAdvanced}
                  />
                <div className={(advanced) ? '' : 'hidden'}>
                  <Textbox
                    label="API Key"
                    tooltip="You can find this in the user settings page."
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
                <Tooltip content="Total input tokens" style="light" placement="top">
                  <div className="ml-3 bg-slate-200 p-1 pl-4 pr-4 rounded-md">
                    {encoded.bpe.length}
                  </div>
                </Tooltip>
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
