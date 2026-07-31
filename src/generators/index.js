import { nextjsGenerator } from "./nextjs.js";
import { viteGenerator } from "./vite.js";
import { expressGenerator } from "./express.js";

export const generators = {
  nextjs: nextjsGenerator,
  vite: viteGenerator,
  express: expressGenerator,
};
