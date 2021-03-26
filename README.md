# dominium

> Break large changes into smaller ones based on mandatory reviewer coverage.

### Install

1) `npm i -g dominium`
2) Install [ripgrep](https://github.com/BurntSushi/ripgrep#installation)


### Usage

Run `dominium` in the root of your git repo to split up your last commit. Your commit message and branch name are used when creating new branches.

```sh
~/myGitRepo[eslint-fix]$ git commit -am "eslint --fix across entire codebase"
~/myGitRepo[eslint-fix]$ dominium
Splitting code into 4 branches:

  [eslint-fix-1] 12 files owned by noah.sugarman, airbnb/someteam
  [eslint-fix-2] 10 files owned by bob-youruncle, amy-lobg
  [eslint-fix-3] 14 files owned by airbnb/uncles
  [eslint-fix-4] 9 files owned by no owner

Proceed? [Y/n] Y

Creating branch eslint-fix-1
Creating branch eslint-fix-2
Creating branch eslint-fix-3
Creating branch eslint-fix-4

Done
~/myGitRepo[eslint-fix]$ git log eslint-fix-1 --oneline -1
7c89b7bb5bd eslint --fix accross entire codebase 1/4
```


### Options

`--owners-file [name]` name of file containing list of owners, default `MANDATORY_REVIEWERS`

`--max-branch-files [max]` max number of files per branch, default `Infinity`


### Limitations / TODOs

* Doesn't read file comments such as `// MANDATORY_REVIEWERS noah bob`.
* Unhelpful error messages.
* Only supports git repos.
* Doesn't know who belongs to which team, which would allow a smarter pull request coverage algorithm.
* Doesn't work if OWNERS file contains information other than teams and usernames.
