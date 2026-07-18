# pdf-partizione

A Node.js CLI tool for combining multiple PDF files into a single document with optional partitioning, separator pages, and page numbering. Built on `pdf-lib` for reliable PDF manipulation.

---

## Features

- **Merge PDFs** — Combine any number of PDF files from a directory into one merged output
- **Create Separator Pages** — Generate cover/separator pages between each source PDF with headers, titles, page counts, and labels extracted directly from filenames
- **Page Numbering** — Add a footer to every generated PDF showing the current page number (left, center, or right position)
- **Group Descriptions** — Apply a custom label across all pages in a group for organization
- **Flexible Input Parsing** — Extract date, header, title, and label values from filenames using customizable delineators and index positions
- **Interactive Mode** — Use `--cli` flag to prompt interactively via the terminal (or provide options directly on the command line)

---

## Quick Start

### Prerequisites

You must have Node installed to run this script. Preferably you should have an LTS version of Node. You can check your current version by running `node -v`. Visit [Node.js](https://nodejs.org/) for more information.

### Installation

Once Node is installed you can build the script from it's source, or skip to the [usage section](#usage) below if you have a pre-built version of the script.

```bash
npm install
npm run build
```

### Usage

After the script is built, you can run the it from the command line.

```bash
node PdfPartizione --dir=./pdfs/ --out-dir=./output/ --merge-all
```

### Command-Line Options

| FLAG                        | USE                                                           | DEFAULT          |
| --------------------------- | ------------------------------------------------------------- | ---------------- |
| --dir                       | source directory                                              | — (required)     |
| --out-dir                   | out directory                                                 | `output `        |
| --merge-all                 | merge all page                                                | `false`          |
| --merged-name               | merged file name                                              | `merged.pdf`     |
| --create-partitions         | generate partition cover pages                                | `true`           |
| --number-pages              | apply page numbers (footer)                                   | `false`          |
| --page-number-position      | position of the page numbers (left, center, right)            | `right`          |
| --name-deli                 | name delineator                                               | `-`              |
| --date-index                | filename index of the date                                    | `0`              |
| --date-format               | the format of the date in the filename                        | `YYYYMMDD`       |
| --label-index               | filename index of cover page label                            | `null`           |
| --label                     | cover page label                                              | `SEPARATOR PAGE` |
| --header-index              | filename index of the cover page header                       | `1`              |
| --date-in-header            | put the date in the cover page header                         | `false`          |
| --title-index               | filename index of the cover page title                        | `2`              |
| --group-desc                | apply a group description (footer)                            | `false`          |
| --label-is-group-label      | use the cover page label as the group label                   | `false`          |
| --group-label               | the group description label                                   | `null`           |
| --group-desc-label-position | position of the group description label (left, center, right) | `null`           |

---

## How It Works

### 1. Read PDFs from a Directory

Place your source PDF files in a directory and point `pdf-partizione` at it:

```bash
node PdfPartizione --dir=./pdfs/
```

The tool reads all `.pdf` files from the specified source directory (non-recursive). Non-PDF files are silently skipped.

### 2. Generate Separator Pages (Optional)

When `--create-partitions` is enabled, each PDF gets a dedicated separator page inserted before it. The separator includes:

- **Header** — extracted from the filename piece at `header-index`, optionally combined with the date
- **Title** — extracted from the filename piece at `title-index`
- **Page Count** — number of pages in the original PDF
- **Label** — extracted from `label-index` or a user-provided value (defaults to "SEPARATOR PAGE")

A bookmark image is also stamped on each separator page for visual identification.

### 3. Merge All PDFs (Optional)

When `--merge-all` is set, all the generated separator + original pages are merged into a single file named by the `--merged-name` option in the output directory. Each PDF gets its own processed version saved to the output directory regardless of `merge-all` being set.

### 4. Apply Page Numbers and Group Label (Optional)

When `--number-pages` or `--group-desc` is enabled, every generated page receives a footer with:

- Current page number and total page count at the `--page-number-position`.
- The group label (from the label or a custom group label) at the `--group-desc-label-position`.
  - When `--page-number-position` and `--group-desc-label-position` are the same, the group label is put to the right of the page number.

---

## Examples

### Merge without separators

```bash
node PdfPartizione --dir=./pdfs/ --out-dir=./output/ --merge-all
```

### Create partitions with page numbers

```bash
node PdfPartizione --dir=./pdfs/ --out-dir=./output/ --create-partitions --number-pages --page-number-position=right
```

### Interactive mode

```bash
node PdfPartizione --cli
```

This will prompt you in the terminal for each option.

---

## Source Code Directory Structure

```
pdf-partizione/
├── src/
│   ├── index.ts                   # CLI entry point
│   ├── modules/
│   │   ├── cli-options.ts         # Interactive prompts (when --cli)
│   │   ├── generateSeparators.ts  # Separator page generation
│   │   ├── noPartitions.ts        # Direct merge without separators
│   │   ├── mergeAll.ts            # Merge all generated PDFs
│   │   ├── generateFooter.ts      # Apply footer/page numbers
│   │   ├── parse-options.ts       # CLI argument / Q&A parsing
│   │   └── log.ts                 # Logging utility
│   └── types/
│       └── index.ts               # Shared type definitions (Args)
├── package.json                   # Package metadata
├── tsconfig.json                  # typescript config
├── vite.config.ts                 # build config
├── biome.json                     # Linting config
└── .vscode/
    └──settings.json               # Editor settings
```

---

## Package Structure

```
PdfPartizione/
├── index.js                        # Main entry point for the script
├── assests/
│   ├── rolldown-runtime-[hash].js  # Runtime library
│   └── vender-[hash].js            # Vendor libraries
└── images/
    └── tag.png                     # Tag image for partitions
```

---

## License

[MIT](https://github.com/Ultra8k/pdf-partizione/tree/ts-config-vite?tab=License-1-ov-file)
