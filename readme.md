# @fizker/serve

A static file HTTP server, designed to be running in Docker.

It has no dependencies and does as little work as possible in order to serve files. This is achieved by running a tool like [@fizker/serve-prepare][1] first to prepare the files.

## How to use

See [@fizker/serve-prepare][1] for how to prepare the Docker container. Once the container is built, execute the following command: `docker run -p <desired HTTP port>:8080 -p <desired HTTPS port>:8081 -d <your docker user>/<your project name>`

Internally, the server is configured to run on port 8080 per default, which is why the `-p <desired HTTP port>:8080` ends with `8080`. If desired, the port can be changed by either altering the Dockerfile or by adding `-e PORT=8080` to the run command. Services such as [Heroku](https://www.heroku.com) will also change the port as they require.

The `8081` port is used for HTTPS connections. It can be configured in a manner similar to the HTTP port. If HTTPS support is not wanted, or you have not set up the certificates yet, that portion can be omitted to avoid exposing an unused port to the Docker container.

[1]: https://github.com/fizker/serve-prepare
