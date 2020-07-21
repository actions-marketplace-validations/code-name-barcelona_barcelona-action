# metadata-test
This action will capture logged metadata and send it to the octostore

## Inputs

### `octostore-endpoint`

**Not Required** The host name if you are hosting your own octostore. Default `"octostore.herokuapp.com"`.

### `log-path`

**Not Required** The path to the log files if you have custom log files being written that you would like to scan for metadata. Default `"/home/runner/runners"`.

## Example usage

uses: machine-learning-apps/octostore-action@v1
with:
  octostore-endpoint: 'octostore.herokuapp.com'
  log-path: '/home/runner/runners'

### Development

To run this locally, you need to clone this repo and then run: `node index.js <path_to_repo>/octostore-action`
