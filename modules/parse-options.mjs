import minimist from "minimist";
import cliOptions from "./cli-options.mjs";

export const parseOptions = async () => {
  let dir,
    outDir,
    nameDelineator,
    createPartitions,
    labelIndex,
    label,
    numberPages,
    pageNumberPos,
    mergeAll,
    mergedName,
    groupDesc,
    labelIsGroupDescLabel,
    groupDescLabel,
    groupDescLabelPos,
    dateIndex,
    dateFormat,
    headerIndex,
    dateInHeader,
    titleIndex;

  // parse command line arguments
  const args = minimist(process.argv.slice(2));

  if (args.cli) {
    const cli_options = await cliOptions();
    dir = cli_options.dir;
    outDir = cli_options.outDir;
    mergeAll = cli_options.mergeAll;
    mergedName = cli_options.mergedName;
    numberPages = cli_options.numberPages;
    pageNumberPos = cli_options.pageNumberPos;
    createPartitions = cli_options.createPartitions;
    nameDelineator = cli_options.nameDelineator;
    labelIndex = cli_options.labelIndex;
    label = cli_options.label;
    groupDesc = cli_options.groupDesc;
    groupDescLabel = cli_options.groupDescLabel;
    groupDescLabelPos = cli_options.groupDescLabelPos;
    labelIsGroupDescLabel = cli_options.labelIsGroupDescLabel;
    dateIndex = cli_options.dateIndex;
    dateFormat = cli_options.dateFormat;
    headerIndex = cli_options.headerIndex;
    dateInHeader = cli_options.dateInHeader;
    titleIndex = cli_options.titleIndex;
  } else {
    dir = args.dir ?? "";
    outDir = args["out-dir"] ?? "output";
    mergeAll = args["merge-all"] === "true" ? true : false;
    mergedName = args["merged-name"] ?? "merged.pdf";
    numberPages = args["number-pages"] === "true" ? true : false;
    pageNumberPos = args["page-number-position"] ?? "right";
    createPartitions = args["create-partitions"] === "false" ? false : true;
    nameDelineator = args["name-deli"] ?? " - ";
    labelIndex = args["label-index"] ?? null;
    label = (!labelIndex && args.label) || "SEPARATOR PAGE";
    groupDescLabel = args["group-label"] ?? null;
    groupDescLabelPos = args["group-desc-label-position"] ?? "right";
    labelIsGroupDescLabel =
      args["label-is-group-label"] === "true" ? true : false;
    groupDesc = labelIsGroupDescLabel || (groupDescLabel ?? false);
    dateIndex = args["date-index"] ?? 0;
    dateFormat = args["date-format"] ?? "YYYYMMDD";
    headerIndex = args["header-index"] ?? 1;
    dateInHeader = args["date-in-header"] === "true" ? true : false;
    titleIndex = args["title-index"] ?? 2;
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
    groupDescLabel,
    groupDescLabelPos,
    labelIsGroupDescLabel,
    dateIndex,
    dateFormat,
    headerIndex,
    dateInHeader,
    titleIndex,
  };
};
