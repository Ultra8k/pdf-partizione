import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import logSymbols from "log-symbols";
import { grayscale, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { Args } from "../types";
import { log } from "./log.js";

/**
 * Applies a footer to all the generated PDFs in the output directory.
 * The footer contains the group label, page number and total pages.
 * The group label is determined by the labelIndex and label options.
 * The page number is determined by the position of the generated PDF in the output directory.
 * The total pages is determined by the totalPages parameter.
 * @param {Args} args - The options for generating the footer.
 * @param {number} totalPages - The total number of pages in the output directory.
 */
export const generateFooter = async (args: Args, totalPages: number) => {
	const {
		outDir,
		nameDelineator,
		labelIndex,
		label,
		numberPages,
		pageNumberPos,
		groupDescLabel,
		labelIsGroupDescLabel,
		dateIndex,
	} = args;

	log(chalk.cyan("Applying footer to generated PDFs."));

	const files = fs.readdirSync(outDir);
	const filteredFiles = files.filter(
		(file) =>
			fs.statSync(path.join(outDir, file)).isFile() &&
			path.extname(file) === ".pdf",
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
			const namePieces = file.split(nameDelineator);
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

			let footerX = 0;
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
		chalk.green(
			logSymbols.success,
			"Success, applied footer to all pages.\n\n",
		),
	);
};
