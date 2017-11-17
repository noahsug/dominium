# dominium
> Break large changes into smaller ones based on mandatory reviewer coverage.

## Install
1) `npm i -g dominium`
2) Dominium uses ripgrep, so you'll need to isntall that as well if you haven't already (also stop using grep): https://github.com/BurntSushi/ripgrep#installation

## Usage
Run `dominium` in the root of your git repo after creating your commit.

**Note:** Your commit message and branch name will be used by dominium.

```
~/myGitRepo[eslint-fix] $ git commit -am "eslint --fix accross entire codebase"
~/myGitRepo[eslint-fix] $ dominium
Splitting code into 4 branches:

  [eslint-fix-1] 12 files owned by noah.sugarman, airbnb/someteam
  [eslint-fix-2] 10 files owned by bob-youruncle, amy-lobg
  [eslint-fix-3] 14 files owned by airbnb/uncles
  [eslint-fix-4] 9 files owned by unowned

Proceed? [Y/n] Y

Creating branch eslint-fix-1
Creating branch eslint-fix-2
Creating branch eslint-fix-3
Creating branch eslint-fix-4

Done
~/myGitRepo[eslint-fix] $ git log eslint-fix-1 --oneline -1
7c89b7bb5bd eslint --fix accross entire codebase 1/4
```
