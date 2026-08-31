How to generate static pages at build time: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes#generating-static-params

How to start the Meilisearch local instance:
```bash
docker run -it --rm \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY='aSampleMasterKey' \
  -v $(pwd)/meili_data:/meili_data \
  getmeili/meilisearch:latest
```