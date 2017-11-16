# dominium
> Break large changes into smaller ones based on mandatory reviewer coverage.

## Install
1) `npm i -g dominium`
2) Dominium uses ripgrep, so you'll need to isntall that as well if you haven't already (also stop using grep): https://github.com/BurntSushi/ripgrep#installation 

## Usage
1) Change a large number of files and commit the change. **Note:** Your commit message and branch name will be used by dominium.
2) In the root of your repo, run `dominium --dryrun` to preview which branches will be created for which reviewers.
3) If everything looks good run `dominium` without the `--dryrun` option.
