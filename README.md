# TEST environment management information

## NODE.JS
- Node 18.19.1
## Next JS
- Next JS 14.0.4

## i added this here to force deploy

## Manage Test TEST env with Docker:

### Recreate ENV
USER_ID=$(id -u) GROUP_ID=$(id -g) docker compose -f docker-compose.test.yaml down
USER_ID=$(id -u) GROUP_ID=$(id -g) docker compose -f docker-compose.test.yaml up --build --force-recreate -d
### Check running containers
USER_ID=$(id -u) GROUP_ID=$(id -g) docker compose -f docker-compose.test.yaml ps
### Follow logs of containers including past 5 minutes
USER_ID=$(id -u) GROUP_ID=$(id -g) docker compose -f docker-compose.test.yaml logs -f --since 5m
### Log into container in case you want to run some nextjs/npm commands
USER_ID=$(id -u) GROUP_ID=$(id -g)  docker compose -f docker-compose.test.yaml exec -ti --user app next-app sh




> Setupul mapeaza urmatoarele foldere direct in container:
>      - ./src:/app/src
>     - ./public:/app/public
>     - ./custom-packages:/app/custom-packages
>     - ./messages:/app/messages
> Orice schimbare a fisierelor din aceste foldere va fi imediat vizibila de catre aplicatie. Daca functioneaza fast-reload ar trebui sa fie imediat vizibil. If not, recreate.
