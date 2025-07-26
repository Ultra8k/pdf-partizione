# pdf-partizione

Create a cover page for a pdf based on it's file name. Used for creating partitions before merging a bunch of pdfs.

Given a set of PDFs, this script can generate a cover page for each with the info parsed from the file name.

A secondary function of this script is to merge a bunch of PDFs without creating partitions.

Optionally include page numbers, footer information and merge many PDFs into one.

# Running the script

Ensure you have [node.js](https://nodejs.org/en) installed.

Open the location of this file in a terminal.

Run `npm install` and wait for the process to finish.

There are 2 methods to run the script, either with flags or with Q and A prompts.

To run the script with flags follow the syntax below.

```
node ./dist/pdf-partizione.js --dir [--out-dir] [--name-deli] [--label] [--number-pages] [--merge-all] [--merged-name] [--group-desc] [--group-label]
```

## Description of flags

| FLAG                   | USE                                                    | REQUIRED | DEFAULT        |
| ---------------------- | ------------------------------------------------------ | -------- | -------------- |
| --dir                  | source directory                                       | required |                |
| --out-dir              | out directory                                          | optional | output         |
| --merge-all            | merge all page                                         | optional | false          |
| --merged-name          | merged file name                                       | optional | merged.pdf     |
| --create-partitions    | generate partition cover pages                         | optional | true           |
| --number-pages         | apply page numbers (footer)                            | optional | false          |
| --page-number-position | position the page numbers appear (left, center, right) | optional | right          |
| --name-deli            | name delineator                                        | optional | ' - '          |
| --date-index           | filename index of the date                             | optional | 0              |
| --date-format          | the format of the date in the filename                 | optional | 'YYYYMMDD'     |
| --label-index          | filename index of cover page label                     | optional | null           |
| --label                | cover page label                                       | optional | SEPARATOR PAGE |
| --header-index         | filename index of the cover page header                | optional | 1              |
| --date-in-header       | put the date in the cover page header                  | optional | false          |
| --title-index          | filename index of the cover page title                 | optional | 2              |
| --group-desc           | apply a group description (footer)                     | optional | false          |
| --label-is-group-label | use the cover page label as the group label            | optional | false          |
| --group-label          | the group description label                            | optional | null           |

To run the script with the Q and A cli use the syntax below.

```
node ./pdf-partizione.js --cli
```

This will activate a series of prompts relative to the flags above. After completing the prompts the generation will begin.
