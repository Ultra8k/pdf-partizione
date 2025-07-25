import { input, number, select } from "@inquirer/prompts";

export default async () => {
	const dir = await input({
		message: "What is the source directory?",
	});
	const outDir = await input({
		message: "What is the output directory?",
		default: "output",
	});

	const mergeAll = await select({
		choices: [
			{
				name: "Yes",
				value: true,
			},
			{
				name: "No",
				value: false,
			},
		],
		message: "Merge all generated files?",
		default: false,
	});
	let mergedName = null;
	if (mergeAll) {
		mergedName = await input({
			message: "Merged file name?",
			default: "merged.pdf",
		});
	}

	const createPartitions = await select({
		choices: [
			{
				name: "Yes",
				value: true,
			},
			{
				name: "No",
				value: false,
			},
		],
		message: "Do you want to create partitions?",
		default: true,
	});

	const numberPages = await select({
		choices: [
			{
				name: "Yes",
				value: true,
			},
			{
				name: "No",
				value: false,
			},
		],
		message: "Apply page numbers?",
		default: false,
	});

	const pageNumberPos = await select({
		choices: [
			{
				name: "Left",
				value: "left",
			},
			{
				name: "Center",
				value: "center",
			},
			{
				name: "Right",
				value: "right",
			},
		],
		message: "Where do you want to place page numbers?",
		default: "right",
	});

	const nameDelineator = await input({
		message: "What is the filename delineator?",
		default: " - ",
	});

	const dateInFilename = await select({
		choices: [
			{
				name: "Yes",
				value: true,
			},
			{
				name: "No",
				value: false,
			},
		],
		message: "Is the date in the filename?",
		default: false,
	});
	let dateIndex = 0,
		dateFormat = "YYYYMMDD";
	if (dateInFilename) {
		dateIndex = (await number({
			message: "What index of the filename is the date?",
			default: 0,
			required: dateInFilename,
		})) as number;
		dateFormat = await select({
			choices: [
				{
					name: "20240130",
					value: "YYYYMMDD",
				},
				{
					name: "2024-01-30",
					value: "YYYY-MM-DD",
				},
				{
					name: "2024/01/30",
					value: "YYYY/MM/DD",
				},
				{
					name: "01302024",
					value: "MMDDYYYY",
				},
				{
					name: "01-30-2024",
					value: "MM-DD-YYYY",
				},
				{
					name: "01/30/2024",
					value: "MM/DD/YYYY",
				},
				{
					name: "30012024",
					value: "DDMMYYYY",
				},
				{
					name: "30-01-2024",
					value: "DD-MM-YYYY",
				},
				{
					name: "30/01/2024",
					value: "DD/MM/YYYY",
				},
			],
			message: "What format is the date in?",
			default: "YYYYMMDD",
		});
	}

	let labelInFilename = null,
		labelIndex = null,
		label = null,
		headerIndex = null,
		headerInFilename = null,
		dateInHeader = false,
		titleInFilename = null,
		titleIndex = null;
	if (createPartitions) {
		labelInFilename = await select({
			choices: [
				{
					name: "Yes",
					value: true,
				},
				{
					name: "No",
					value: false,
				},
			],
			message: "Is the cover page label in the filename?",
			default: false,
		});
		if (labelInFilename) {
			labelIndex = await number({
				message: "What index of the filename is the cover page label?",
				required: labelInFilename,
			});
		} else {
			label = await input({
				message: "What is the cover page label?",
				default: "SEPARATOR PAGE",
			});
		}

		headerInFilename = await select({
			choices: [
				{
					name: "Yes",
					value: true,
				},
				{
					name: "No",
					value: false,
				},
			],
			message: "Is the cover page header in the filename?",
			default: false,
		});
		if (headerInFilename) {
			headerIndex = await number({
				message: "What index of the filename is the header?",
				default: 1,
				required: headerInFilename,
			});
		}

		dateInHeader = await select({
			choices: [
				{
					name: "Yes",
					value: true,
				},
				{
					name: "No",
					value: false,
				},
			],
			message: "Should the date be in the cover page header?",
			default: false,
		});

		titleInFilename = await select({
			choices: [
				{
					name: "Yes",
					value: true,
				},
				{
					name: "No",
					value: false,
				},
			],
			message: "Is the cover page title in the filename?",
			default: false,
		});
		if (titleInFilename) {
			titleIndex = await number({
				message: "What index of the filename is the title?",
				default: 2,
				required: titleInFilename,
			});
		}
	}

	const groupDesc = await select({
		choices: [
			{
				name: "Yes",
				value: true,
			},
			{
				name: "No",
				value: false,
			},
		],
		message: "Use a Group Description?",
		default: false,
	});
	let labelIsGroupDescLabel = false;
	if (createPartitions && groupDesc) {
		labelIsGroupDescLabel = await select({
			choices: [
				{
					name: "Yes",
					value: true,
				},
				{
					name: "No",
					value: false,
				},
			],
			message: "Is the cover page label the group description label?",
			default: false,
		});
	}
	let groupDescLabel = null,
		groupDescLabelPos = null;
	if (groupDesc && !labelIsGroupDescLabel) {
		groupDescLabel = await input({
			message: "What is the group description label?",
		});
		groupDescLabelPos = await select({
			choices: [
				{
					name: "Left",
					value: "left",
				},
				{
					name: "Center",
					value: "center",
				},
				{
					name: "Right",
					value: "right",
				},
			],
			message: "Where do want to place the group description label?",
			default: "right",
		});
	}

	return {
		dir,
		outDir,
		mergeAll,
		mergedName,
		numberPages,
		pageNumberPos,
		createPartitions,
		nameDelineator,
		labelIndex,
		label,
		groupDesc,
		labelIsGroupDescLabel,
		groupDescLabel,
		groupDescLabelPos,
		dateIndex,
		dateFormat,
		headerIndex,
		dateInHeader,
		titleIndex,
	};
};
