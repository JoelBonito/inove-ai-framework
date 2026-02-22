import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const TS_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".cts"]);
const JS_EXTENSIONS = new Set([".js", ".mjs", ".cjs"]);

const compilerOptions = loadCompilerOptions();

function loadCompilerOptions() {
  const baseOptions = {
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
    sourceMap: true,
    esModuleInterop: true,
  };

  const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, "tsconfig.json");
  if (!configPath) {
    return baseOptions;
  }

  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  if (configFile.error) {
    return baseOptions;
  }

  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(configPath),
  );

  return {
    ...baseOptions,
    ...parsed.options,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    sourceMap: true,
  };
}

function tryResolveTsAlias(specifier, parentURL) {
  if (!parentURL) return null;
  if (!specifier.startsWith("./") && !specifier.startsWith("../") && !specifier.startsWith("/")) {
    return null;
  }

  const ext = path.extname(specifier);
  if (!JS_EXTENSIONS.has(ext)) return null;

  const base = specifier.slice(0, specifier.length - ext.length);
  const parentPath = fileURLToPath(parentURL);
  for (const candidateExt of TS_EXTENSIONS) {
    const candidatePath = path.resolve(path.dirname(parentPath), `${base}${candidateExt}`);
    if (existsSync(candidatePath)) {
      return pathToFileURL(candidatePath).href;
    }
  }
  return null;
}

export async function resolve(specifier, context, defaultResolve) {
  try {
    return await defaultResolve(specifier, context, defaultResolve);
  } catch (error) {
    if (error?.code === "ERR_UNKNOWN_FILE_EXTENSION" && error.url) {
      const ext = path.extname(new URL(error.url).pathname);
      if (TS_EXTENSIONS.has(ext)) {
        return { url: error.url };
      }
    }

    const aliasUrl = tryResolveTsAlias(specifier, context.parentURL);
    if (aliasUrl) {
      return { url: aliasUrl };
    }

    throw error;
  }
}

export async function load(url, context, defaultLoad) {
  const ext = path.extname(new URL(url).pathname);
  if (!TS_EXTENSIONS.has(ext)) {
    return defaultLoad(url, context, defaultLoad);
  }

  const fileName = fileURLToPath(url);
  const source = await readFile(fileName, "utf-8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions,
    fileName,
    reportDiagnostics: false,
  });

  let output = transpiled.outputText;
  if (transpiled.sourceMapText) {
    const mapBase64 = Buffer.from(transpiled.sourceMapText, "utf-8").toString("base64");
    output += `\n//# sourceMappingURL=data:application/json;base64,${mapBase64}`;
  }

  const format = ext === ".cts" ? "commonjs" : "module";
  return { format, source: output, shortCircuit: true };
}
