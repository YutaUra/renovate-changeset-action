# typescript-action [![ts](https://github.com/yutaura/typescript-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/yutaura/typescript-action/actions/workflows/ts.yaml)

This is a template of TypeScript action.
Inspired from https://github.com/actions/typescript-action and https://github.com/int128/typescript-action.

## Features

- Ready to develop with the minimum configs
  - biome
  - tsconfig
  - vitest
  - changeset
- Automated continuous release
- Keep consistency of generated files
- Shipped with Renovate config

## Getting Started

Click `Use this template` to create a repository.

Then checkout your repository and test it. Node.js is required.

```console
$ git clone https://github.com/your/repo.git

$ pnpm i
$ pnpm test
```

Create a pull request for a change.

you can use `changeset` to manage the version.

```console
$ git checkout -b feature
$ pnpm changeset add
$ git commit -m 'Add feature'
$ gh pr create -fd
```

Once you merge a pull request, pr to create a release will be created automatically.
you can merge release pr, then a new release will be created.

## Specification

To run this action, create a workflow as follows:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: int128/typescript-action@v1
        with:
          name: hello
```

### Inputs

| Name   | Default    | Description   |
| ------ | ---------- | ------------- |
| `name` | (required) | example input |

### Outputs

| Name      | Description    |
| --------- | -------------- |
| `example` | example output |

## Development

### Keep consistency of generated files

If a pull request needs to be fixed by Prettier, an additional commit to fix it will be added by GitHub Actions.
See https://github.com/int128/update-generated-files-action for details.

### Dependency update

You can enable Renovate to update the dependencies.
This repository is shipped with the config https://github.com/int128/typescript-action-renovate-config.
