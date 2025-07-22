import path from "node:path";
import fs from "node:fs";
import { PDFDocument, StandardFonts, rgb, grayscale } from "pdf-lib";
import chalk from "chalk";
import logSymbols from "log-symbols";
import { log } from "./log.js";
import { Args } from "../types";

export const generateFooter = async (args: Args, totalPages: number) => {
  const {
    outDir,
    nameDelineator,
    labelIndex,
    label,
    numberPages,
    pageNumberPos,
    groupDescLabel,
    groupDescLabelPos,
    labelIsGroupDescLabel,
    dateIndex,
  } = args;

  log(chalk.cyan("Applying footer to generated PDFs."));

  const files = fs.readdirSync(outDir);
  const filteredFiles = files.filter(
    (file) =>
      fs.statSync(path.join(outDir, file)).isFile() &&
      path.extname(file) === ".pdf"
  );
  const sortedFiles =
    dateIndex !== null
      ? filteredFiles.sort((a, b) => {
          const sorterA = +a.split(nameDelineator)[0];
          const sorterB = +b.split(nameDelineator)[0];
          return sorterA - sorterB;
        })
      : filteredFiles.sort();
  let currentPage = 1;

  for (const file of sortedFiles) {
    const pdfBytes = fs.readFileSync(path.join(outDir, file));
    const pdf = await PDFDocument.load(pdfBytes);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const pages = pdf.getPages();

    let separatorPageLabel = null;
    if (labelIsGroupDescLabel) {
      // parse pdf file names to get pieces
      let namePieces = file.split(nameDelineator);
      // remove '.pdf' from last name piece
      namePieces[namePieces.length - 1] = namePieces[
        namePieces.length - 1
      ].slice(0, namePieces[namePieces.length - 1].length - 4);

      separatorPageLabel =
        labelIndex !== null && labelIndex !== undefined
          ? namePieces[labelIndex]
          : label;
    }
    const groupLabel =
      labelIsGroupDescLabel && separatorPageLabel
        ? separatorPageLabel
        : groupDescLabel;

    pages.forEach((page) => {
      const { width } = page.getSize();
      let footer = `${
        groupLabel ?? "_"
      } - Page ${currentPage} of ${totalPages}`;
      if (!groupLabel) footer = footer.split(" - ")[1];
      if (!numberPages) footer = footer.split(" - ")[0];

      let footerX;
      switch (pageNumberPos) {
        case "left":
          footerX = 36;
          break;
        case "center":
          footerX = width / 2 - font.widthOfTextAtSize(footer, 8) / 2;
          break;
        default:
          footerX = width - 36 - font.widthOfTextAtSize(footer, 8);
      }

      page.drawRectangle({
        x: footerX * 1.2,
        y: 36,
        width: font.widthOfTextAtSize(footer, 8) * 1.2,
        height: font.heightAtSize(8) * 1.5,
        color: grayscale(1),
      });
      page.drawText(footer, {
        x: footerX,
        y: 36 + font.heightAtSize(8) / 2,
        size: 8,
        font,
        color: rgb(0, 0, 0),
      });

      if (numberPages) currentPage += 1;
    });

    const pageBytes = await pdf.save();
    fs.writeFileSync(path.join(outDir, path.basename(file)), pageBytes);
  }

  log(
    chalk.green(logSymbols.success, "Success, applied footer to all pages.\n\n")
  );
};
