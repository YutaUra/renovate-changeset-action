# renovate-changeset-action [![ts](https://github.com/yutaura/renovate-changeset-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/yutaura/renovate-changeset-action/actions/workflows/ts.yaml)

This action creates changeset files for the PR created by Renovate.

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
