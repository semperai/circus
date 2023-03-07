# Circus

LLM inference frontend interface which supports OpenAI compatible APIs.

See live [circus.semper.ai](https://circus.semper.ai/)

#### Features

* Designed for self-hosting
* Customizeable presets and models
* Built-in code editor
* Markdown rendering
* Streaming response support

## Local Setup

### Install

* [nvm](https://github.com/nvm-sh/nvm)
* [yarn](https://yarnpkg.com/)

```sh
git clone https://github.com/semperai/circus
cd circus
cp env.example .env.local
vim .env.local
nvm use
yarn
```

### Run

```
yarn dev
```

### Build

```
yarn build
```

## Customization

Presets and models may be specified in the `./src/models.json` and `./src/presets.json` files.

## License

This project is licensed under the MIT License

## Similar Projects

* [oobabooga/text-generation-webui](https://github.com/oobabooga/text-generation-webui)
* [sevazhidkov/prompts-ai](https://github.com/sevazhidkov/prompts-ai)
