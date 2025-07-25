import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import logSymbols from "log-symbols";
import { PDFDocument } from "pdf-lib";
import type { Args } from "../types";
import { log } from "./log.js";

/**
 * Merge all generated PDFs into one PDF.
 * @param {Args} args - The options for generating the pdf.
 */
export const mergeAll = async (args: Args) => {
	const { outDir, nameDelineator, mergedName, dateIndex } = args;

	log(chalk.cyan("Merging all generated PDFs."));

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
	const pdfDoc = await PDFDocument.create();

	for (const file of sortedFiles) {
		const pdfReadBytes = fs.readFileSync(path.join(outDir, file));
		const pdfRead = await PDFDocument.load(pdfReadBytes);
		const pdfReadIndices = pdfRead.getPageIndices();
		const pdfCopy = await pdfDoc.copyPages(pdfRead, pdfReadIndices);
		pdfCopy.forEach((page) => {
			pdfDoc.addPage(page);
		});
	}

	const pdfWriteBytes = await pdfDoc.save();
	fs.writeFileSync(path.join(outDir, mergedName), pdfWriteBytes);

	log(
		chalk.green(
			logSymbols.success,
			"Success, all PDFs merged and",
			chalk.white.bold(`${path.join(outDir, mergedName)}`),
			"has been created.\n\n",
		),
	);
};
