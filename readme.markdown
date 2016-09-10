# nilla

nilla is a web interface for [rtorrent](https://github.com/rakshasa/rtorrent).

The front-end is built on React + Redux with React-Router and Reselect.

# Environment Variables

| variable                       | purpose                                |
|:-------------------------------|:---------------------------------------|
| `JWT_SECRET`                   | Key used to encrypt the JWT            |
| `SERVE_DOWNLOADS`              | Whether to serve files                 |
| `SERVE_ASSETS`                 | Whether to serve assets                |
| `HOST`                         | The host to bind on                    |
| `PORT`                         | The port to bind on                    |
| `RTORRENT_DOWNLOADS_DIRECTORY` | Path to rtorrent downloads directory   |
| `RTORRENT_SOCKET`              | Path to rtorrent unix domain socket    |
| `RTORRENT_HOST`                | Host that rtorrent RPC is listening on |
| `RTORRENT_PORT`                | Port that rtorrent RPC is listening on |
