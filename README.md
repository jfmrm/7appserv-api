# 7appserv-api
7appserv is a marketplace for house keeping services based on reversal auction

# Instructions to run this project

You gonna need to install Docker and Docker Compose in order to run it.
To do so follow these instructions:
  - Docker: https://www.docker.com/products/docker
  - Docker Compose: https://docs.docker.com/compose/).

After installing run the following commands (if you are not root user you might need to use sudo in order to do so):
  ```
  docker-compose build
  docker-compose up
  ```

The populate.js file is a function that tests all cruds, to use it uncomment its lines and its call on server.js file.
