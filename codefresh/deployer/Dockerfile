FROM launcher.gcr.io/google/debian9 AS build

RUN apt-get update \
    && apt-get install -y --no-install-recommends gettext

ADD schema.yaml /tmp/schema.yaml

# Provide registry prefix and tag for default values for images.
ARG REGISTRY
ARG TAG
RUN cat /tmp/schema.yaml \
    | env -i "REGISTRY=$REGISTRY" "TAG=$TAG" envsubst \
    > /tmp/schema.yaml.new \
    && mv /tmp/schema.yaml.new /tmp/schema.yaml

FROM gcr.io/cloud-marketplace-tools/k8s/deployer_helm

COPY chart /data/chart

# Package Helm chart(s) source into .tar.gz format expected by create_manifests.sh
RUN set -x && \
    cd /data/chart && \
    for d in $(find . -type d -mindepth 1 -maxdepth 1); do \
        mkdir chart && cp -r $d/* chart && rm -rf $d/* && mv chart $d/chart && cd $d && tar -zcvf ../$d.tar.gz . && cd ../ && rm -rf $d; done

COPY --from=build /tmp/schema.yaml /data/
