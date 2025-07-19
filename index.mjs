import path from "path";
import fs from "fs";
import chalk from "chalk";
import { oraPromise } from "ora";
import logSymbols from "log-symbols";
import {
  parseOptions,
  generateSeparators,
  generateFooter,
  mergeAll as mergeAllPdfs,
  log,
} from "./modules/index.mjs";

const args = await parseOptions();
const { dir, outDir, numberPages, mergeAll, mergedName, groupDesc } = args;

if (!dir) {
  log(
    chalk.redBright(
      logSymbols.error,
      "The source directory is required. Usage: node ./index.mjs [--cli | --dir=<source directory>]"
    )
  );
  process.exit(1);
}

try {
  fs.accessSync(dir);
} catch (error) {
  log(
    chalk.redBright(
      `${logSymbols.error} Can not access ${dir}. The directory doesn't exist or you do not have permission to read and write to it.\nExiting...\n`
    )
  );
  process.exit(1);
}

try {
  fs.accessSync(outDir);
} catch (error) {
  log(
    chalk.cyanBright(`${logSymbols.info} Creating output directory ${outDir}\n`)
  );
  fs.mkdirSync(outDir);
}

// delete existing merged pdf if any
try {
  fs.accessSync(path.join(outDir, mergedName));
  log(chalk.yellow(logSymbols.warning, "Deleting existing merged PDF...\n"));
  fs.unlinkSync(path.join(outDir, mergedName));
} catch (error) {}

const run = async () => {
  const totalPages = await generateSeparators(args);
  if (numberPages || groupDesc) {
    await generateFooter(args, totalPages);
  }
  if (mergeAll) {
    await mergeAllPdfs(args);
  }
};

oraPromise(run, {
  successText: chalk.green("DONE!"),
});
