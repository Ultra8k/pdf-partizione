import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { PDFDocument, StandardFonts, PageSizes, rgb, degrees } from "pdf-lib";
import chalk from "chalk";
import logSymbols from "log-symbols";
import { log } from "./log.js";
import { generateFooter } from "./generateFooter.js";
import { mergeAll as mergeAllPdfs } from "./mergeAll.js";
import { Args } from "../types";

/**
 * Generates separator pages for each PDF in the source directory.
 * The separator pages have a header, title, page length, and label.
 * The header is the date from the filename, or the headerIndex from the filename.
 * The title is the titleIndex from the filename.
 * The page length is the number of pages in the original PDF.
 * The label is the labelIndex from the filename, or the label option.
 * The separator pages are saved to the output directory with the same name as the original PDF.
 * If numberPages or groupDesc is true, calls generateFooter with the total number of pages.
 * If mergeAll is true, calls mergeAllPdfs after all separator pages are generated.
 * @param {Args} args - The options for generating the separator pages.
 */
export const generateSeparators = async (args: Args) => {
  const {
    dir,
    outDir,
    nameDelineator,
    labelIndex,
    label,
    dateIndex,
    dateFormat,
    headerIndex,
    dateInHeader,
    titleIndex,
    numberPages,
    groupDesc,
    mergeAll,
  } = args;

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // page sizes
  const letter = PageSizes.Letter;
  const letterWidth = letter[0];
  const letterHeight = letter[1];

  const fontSize = 14;
  const headerFontSize = 16;
  const labelFontSize = 50;
  let totalPages = 0;

  log(chalk.cyan(`Reading source directory ${dir}`));

  const files = fs.readdirSync(dir);
  const filteredFiles = files.filter(
    (file) =>
      fs.statSync(path.join(dir, file)).isFile() &&
      path.extname(file) === ".pdf"
  );
  const sortedFiles =
    dateIndex === 0
      ? filteredFiles.sort((a, b) => {
          const sorterA = +a.split(nameDelineator)[0];
          const sorterB = +b.split(nameDelineator)[0];
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

    // parse pdf file names to get pieces
    let namePieces = file.split(nameDelineator);
    // remove '.pdf' from last name piece
    namePieces[namePieces.length - 1] = namePieces[namePieces.length - 1].slice(
      0,
      namePieces[namePieces.length - 1].length - 4
    );

    // get date from filename
    const separatorPageDate =
      dateIndex !== null && dateIndex !== undefined
        ? namePieces[dateIndex].substring(0, dateFormat.length)
        : "";
    const separatorPageHeader =
      headerIndex !== null && headerIndex !== undefined
        ? namePieces[headerIndex]
        : "";
    const separatorPageTitle =
      titleIndex !== null && titleIndex !== undefined
        ? namePieces[titleIndex]
        : "";
    const separatorPageLabel =
      labelIndex !== null && labelIndex !== undefined
        ? namePieces[labelIndex]
        : label;

    // create separator page
    const sepPdfDoc = await PDFDocument.create();
    const font = await sepPdfDoc.embedFont(StandardFonts.Helvetica);
    const page = sepPdfDoc.addPage(PageSizes.Letter);
    const { width, height } = page.getSize();
    totalPages += 1;

    // load bookmark image
    const bookmarkUrl = path.join(__dirname, "../images/tab.png");
    const bookmarkImage = await sepPdfDoc.embedPng(
      fs.readFileSync(bookmarkUrl)
    );
    const bookmarkDims = bookmarkImage.scale(0.25);
    // draw bookmark
    page.drawImage(bookmarkImage, {
      x: width - bookmarkDims.height,
      y: height,
      width: bookmarkDims.width,
      height: bookmarkDims.height,
      rotate: degrees(-90),
    });

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

    // construct text blocks
    const header = dateInHeader
      ? [separatorPageDate, separatorPageHeader]
      : [separatorPageHeader];
    const title = separatorPageTitle;
    const pageLength = `${orgPdfPagesLength} page${
      orgPdfPagesLength > 1 ? "s" : ""
    }`;

    log(
      chalk.cyan(
        "Creating page with content:\n\n",
        chalk.blueBright(
          `${header[0]}\n${header[1]}\n${title}\n${pageLength}\n${separatorPageLabel}`
        )
      ),
      "\n"
    );

    const textWidth = (text: string, textFontSize: number) =>
      font.widthOfTextAtSize(text, textFontSize);
    const textHeight = (textFontSize: number) =>
      font.heightAtSize(textFontSize);

    // draw text line
    const drawText = (text: string, textFontSize: number, offset = 0) =>
      page.drawText(text, {
        x: offset - textHeight(textFontSize) / 2,
        y: height / 2 + textWidth(text, textFontSize) / 2,
        size: textFontSize,
        font,
        color: rgb(0, 0, 0),
        rotate: degrees(-90),
      });

    // draw cover page header
    drawText(header[0], headerFontSize, width - bookmarkDims.height * 1.5);
    if (dateInHeader) {
      drawText(
        header[1],
        headerFontSize,
        width - bookmarkDims.height * 1.5 - textHeight(headerFontSize) * 1.5
      );
    }

    // draw cover page title
    drawText(
      title,
      fontSize,
      width -
        bookmarkDims.height * 1.5 -
        textHeight(headerFontSize) * 1.5 * 2 -
        textHeight(fontSize) * 1.5
    );

    // draw cover page page length
    drawText(
      pageLength,
      fontSize,
      width -
        bookmarkDims.height * 1.5 -
        textHeight(headerFontSize) * 1.5 * 2 -
        textHeight(fontSize) * 1.5 * 3
    );

    // draw cover page label
    drawText(separatorPageLabel, labelFontSize, width / 2);

    // copy original pdf pages to separator pdf
    log(chalk.cyan(`Copying ${orgPdfPages.length} original pages`));

    const orgPdfCopy = await sepPdfDoc.copyPages(orgPdfDoc, orgPdfPages);
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
      sepPdfDoc.addPage(orgPage);
    });

    // save pdf with separator and original pages
    log(chalk.cyan("Saving new PDF to output directory"));

    const separatorPageBytes = await sepPdfDoc.save();
    fs.writeFileSync(
      path.join(outDir, path.basename(file)),
      separatorPageBytes
    );

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
