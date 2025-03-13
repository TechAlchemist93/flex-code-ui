import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import babel from "vite-plugin-babel";

export default defineConfig({
  plugins: [
    solidPlugin({
      babel: {
        plugins: [
          [
            "@babel/plugin-proposal-pipeline-operator",
            { loose: true, proposal: "hack", topicToken: "^^" },
          ],
        ],
      },
    }),
    babel({
      babelConfig: {
        babelrc: false,
        configFile: false,
        plugins: [
          [
            "@babel/plugin-proposal-pipeline-operator",
            { loose: true, proposal: "hack", topicToken: "^^" },
          ],
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  publicDir: "public",
  build: {
    target: "esnext",
  },
});
