# metadata-test
This action will capture logged metadata and send it to the barcelona

## Inputs

``` 
Example:
http://contoso.com/api/filepath?code=<UUID>

BARCELONA_WRITER_ENDPOINT_REMOTE: => contoso.com
BARCELONA_WRITER_PATH: => /api/filepath?code=
```

### `BARCELONA_WRITER_ENDPOINT_REMOTE`

**Not Required** The URL of your endpoint that will write the json blob to a file store. In the above, it is `contoso.com`

### `BARCELONA_WRITER_PATH`

**Not Required** Full path (including any code information) for submitting the information. In the above, it is `/api/filepath?code=`

### `LOG_PATH`

**Not Required** The path to the log files if you have custom log files being written that you would like to scan for metadata. Default `"/home/runner/runners"`.

## Example usage
```
uses: machine-learning-apps/barcelona-action@v1
with:
  barcelona-endpoint: 'barcelona.herokuapp.com'
  log-path: '/home/runner/runners'
```
### Development

To run this locally, you need to clone this repo and then run: `node index.js <path_to_repo>/barcelona-action`
