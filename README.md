## Usage

If you don't have it already, you'll need `pnpm` to run this project:

```sh
brew install pnpm
```

Once you have `pnpm`, install the project:

```bash
$ pnpm install # or pnpm install or yarn install
```

## Local API

The local API is accomplished via [Mock Service Worker](https://mswjs.io/). This enables fetch requests to be made, that are intercepting by a service worker, which then sends back data.

## Available Scripts

In the project directory, you can run:

### `npm run dev` or `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)

## This project was created with the [Solid CLI](https://solid-cli.netlify.app)
