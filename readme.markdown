# nilla

nilla is a web interface for [rtorrent](https://github.com/rakshasa/rtorrent).

The front-end is built on React + Redux with React-Router and Reselect.

# Environment Variables

JWT_SECRET: The secret key to use to encrypt the JWT.
SERVE_DOWNLOADS: Whether the server should forego serving the files to the user, perhaps because another web server will be doing this task.
SERVE_ASSETS: Whether the server should serve static assets.
SERVER_HOST: The host to bind on.
SERVER_PORT: the port to listen on.
RTORRENT_DOWNLOADS_DIRECTORY: The path to the rtorrent downloads directory.
RTORRENT_SOCKET: The path to the rtorrent unix domain socket
RTORRENT_HOST: The host that rtorrent is listening on.
RTORRENT_PORT: the port that rtorrent is listening on.
