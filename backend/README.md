# 1. Run a development server

If you want to run your own development server, you'll need to create a `.env` file inside the `/backend` directory and fill it with your information.

Then, simply run

```shell
npm run dev
```

## 1.1. Environment variables

| Variable              | Default value     | Description                                                  |
| --------------------- | ----------------- | ------------------------------------------------------------ |
| `STRONGHOLD_PASS`     | `undefined`       | A password used to securely store the DID's secret key.      |
| `STRONGHOLD_PATH`     | `./identity.hodl` | Where the DID's secret key will be stored.                   |
| `INSTITUTION_DID`     | `undefined`       | An existing DID URL to use for your institution.             |
| `INSTITUTION_NAME`    | `undefined`       | Used to fill a name field in VCs issued by this DID.         |
| `INSTITUTION_WEBSITE` | `undefined`       | Used to fill a homepage field in VCs issued by this DID.     |
| `INSTITUTION_NETWORK` | `dev`             | The IOTA Tangle to use.                                      |
| `NODE_ENV`            | `undefined`       | Set it to `development` to enable some debug console prints. |
| `PRIMARY_NODE_URL`    | `undefined`       | The primary node URL used for operations on the Tangle.      |