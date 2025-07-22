import path from "node:path";
import fs from "node:fs";
import { PDFDocument, PageSizes, degrees } from "pdf-lib";
import chalk from "chalk";
import logSymbols from "log-symbols";
import { log } from "./log.mjs";
import { generateFooter } from "./generateFooter.mjs";
import { mergeAll as mergeAllPdfs } from "./mergeAll.mjs";

export const noPartitions = async (args) => {
  const {
    dir,
    outDir,
    nameDelineator,
    dateIndex,
    numberPages,
    groupDesc,
    mergeAll,
  } = args;

  // page sizes
  const letter = PageSizes.Letter;
  const letterWidth = letter[0];
  const letterHeight = letter[1];
  let totalPages = 0;

  log(chalk.cyan(`Reading source directory ${dir}`));

  const files = fs.readdirSync(dir);
  const filteredFiles = files.filter(
    (file) =>
      fs.statSync(path.join(dir, file)).isFile() &&
      path.extname(file) === ".pdf"
  );
  const sortedFiles =
    dateIndex !== null
      ? filteredFiles.sort((a, b) => {
          const sorterA = +a.split(nameDelineator)[dateIndex];
          const sorterB = +b.split(nameDelineator)[dateIndex];
          return sorterA - sorterB;
        })
      : filteredFiles.sort();

  log(chalk.cyan(`Found ${sortedFiles.length} PDF files`));

  for (const file of sortedFiles) {
    log(chalk.cyan("Processing", chalk.white(`${file}`)));

    // get file path
    const filePath = path.join(dir, file);

    // check if file is a pdf
    if (!fs.statSync(filePath).isFile() || path.extname(filePath) !== ".pdf") {
      log(
        chalk.red(
          `${logSymbols.error} Skipping ${file}, this is not a PDF file`
        )
      );
      continue;
    }

    // create pdf
    const pdfDoc = await PDFDocument.create();

    // load original pdf
    log(chalk.cyan("Loading original PDF"));

    const orgPdfDoc = await PDFDocument.load(
      fs.readFileSync(path.join(dir, file))
    );

    // get original pdf page indices
    log(chalk.cyan("Getting number of original PDF pages"));

    const orgPdfPages = orgPdfDoc.getPageIndices();
    const orgPdfPagesLength = orgPdfPages.length;
    totalPages += orgPdfPagesLength;

    // copy original pdf pages to separator pdf
    log(chalk.cyan(`Copying ${orgPdfPages.length} original pages`));

    const orgPdfCopy = await pdfDoc.copyPages(orgPdfDoc, orgPdfPages);
    orgPdfCopy.forEach((orgPage) => {
      // check orgPage size
      const orgHeight = orgPage.getHeight();
      const orgWidth = orgPage.getWidth();
      const heightScale = (letterHeight / orgHeight) * 0.9;
      const widthScale = (letterWidth / orgWidth) * 0.9;

      // resize if not letter
      if (orgHeight !== letterHeight) {
        orgPage.setHeight(letterHeight);
      }
      if (orgWidth !== letterWidth) {
        orgPage.setWidth(letterWidth);
      }

      // scale original content
      orgPage.scaleContent(widthScale, heightScale);

      // move content
      orgPage.resetPosition();
      orgPage.translateContent(30.6, 60);

      // rotate page
      orgPage.setRotation(degrees(0));

      // add orgPage
      pdfDoc.addPage(orgPage);
    });

    // save pdf with separator and original pages
    log(chalk.cyan("Saving new PDF to output directory"));

    const pdfDocBytes = await pdfDoc.save();
    fs.writeFileSync(path.join(outDir, path.basename(file)), pdfDocBytes);

    log(
      chalk.green(
        logSymbols.success,
        "Success",
        chalk.white.bold(`${path.join(outDir, path.basename(file))}`),
        "has been created.\n"
      )
    );
  }

  log(chalk.green(logSymbols.success, "Success, all PDFs generated.\n\n"));

  if (numberPages || groupDesc) {
    await generateFooter(args, totalPages);
  }
  if (mergeAll) {
    await mergeAllPdfs(args);
  }
};
