# renovate-changeset-action [![ts](https://github.com/yutaura/renovate-changeset-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/yutaura/renovate-changeset-action/actions/workflows/ts.yaml)

This action creates changeset files for the PR created by Renovate.

## Specification

To run this action, create a workflow as follows:

```yaml
on:
  push:
    branches:
      - renovate/*

jobs:
  build:
    runs-on: ubuntu-latest
    if: github.event.head_commit.author.username == 'renovate[bot]'
    steps:
      - uses: actions/checkout@v4

      - uses: YutaUra/renovate-changeset-action@v0.0.2
        with:
          message: ${{ github.event.head_commit.message }}
```

### Inputs

| Name                | Default                         | Description                                                                                                |
| ------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `message`           | (required)                      | changeset message                                                                                          |
| `commit-message`    | `create changeset for renovate` | commit message                                                                                             |
| `dry-run`           | `false`                         | if true, the action will not create a changeset file                                                       |
| `working-directory` | `.`                             | root directory                                                                                             |
| `pnpm-workspace`    | `false`                         | if true, the action respects the workspace of pnpm                                                         |
| `setup-git-user`    | `true`                          | if true, the action sets the git user(`github-actions[bot]<github-actions[bot]@users.noreply.github.com>`) |

### Outputs


## Development

### Keep consistency of generated files

If a pull request needs to be fixed by Prettier, an additional commit to fix it will be added by GitHub Actions.
See https://github.com/int128/update-generated-files-action for details.

### Dependency update

You can enable Renovate to update the dependencies.
This repository is shipped with the config https://github.com/int128/typescript-action-renovate-config.
