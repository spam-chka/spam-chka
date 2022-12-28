# update app without losing data in mongo
docker-compose stop app
docker-compose rm app
docker-compose up -d
