TAG ?= latest

# Must have Codefresh API key
ifeq ($(CF_API_KEY),)
$(error Must set CF_API_KEY.)
endif

# crd.Makefile provides targets to install Application CRD.
include ../vendor/marketplace-tools/crd.Makefile

# gcloud.Makefile provides default values for
# REGISTRY and NAMESPACE derived from local
# gcloud and kubectl environments.
include ../vendor/marketplace-tools/gcloud.Makefile

# marketplace.Makefile provides targets such as
# ".build/marketplace/deployer/envsubst" to build the base
# deployer images locally.
include ../vendor/marketplace-tools/marketplace.Makefile

# ubbagent.Makefile provides ".build/ubbagent/ubbagent"
# target to build the ubbagent image locally.
include ../vendor/marketplace-tools/ubbagent.Makefile
include ../vendor/marketplace-tools/var.Makefile

# app.Makefile provides the main targets for installing the
# application.
# It requires several APP_* variables defined as followed.
include ../vendor/marketplace-tools/app.Makefile


APP_DEPLOYER_IMAGE ?= $(REGISTRY)/example/codefresh/deployer:$(TAG)
NAME ?= codefresh-1
APP_PARAMETERS ?= { \
  "name": "$(NAME)", \
  "namespace": "$(NAMESPACE)", \
  "codefreshApiKey": "$(CF_API_KEY)", \
  "imageCodefresh": "$(REGISTRY)/kube-agent:$(TAG)", \
  "imageInit": "$(REGISTRY)/example/codefresh/init:$(TAG)", \
  "imageMysql": "$(REGISTRY)/example/codefresh/mysql:$(TAG)", \
  "imageUbbagent": "$(REGISTRY)/example/codefresh/ubbagent:$(TAG)", \
  "reportingSecret": "$(NAME)-reporting-secret" \
}
TESTER_IMAGE ?= $(REGISTRY)/example/codefresh/tester:$(TAG)
APP_TEST_PARAMETERS ?= { \
  "imageTester": "$(TESTER_IMAGE)" \
}

# Extend the target as defined in app.Makefile to
# include real dependencies.
app/build:: .build/codefresh/deployer \
            .build/codefresh/init \
            .build/codefresh/mysql \
            .build/codefresh/tester \
            .build/codefresh/ubbagent \
            .build/codefresh/codefresh


.build/codefresh: | .build
	mkdir -p "$@"

.build/codefresh/deployer: apptest/deployer/* \
                           apptest/deployer/manifest/* \
                           deployer/* \
                           chart/* \
                           schema.yaml \
                           .build/marketplace/deployer/envsubst \
                           .build/var/APP_DEPLOYER_IMAGE \
                           .build/var/REGISTRY \
                           .build/var/TAG \
                           | .build/codefresh
	$(call print_target, $@)
	docker build \
	    --build-arg REGISTRY="$(REGISTRY)/example/codefresh" \
	    --build-arg TAG="$(TAG)" \
	    --tag "$(APP_DEPLOYER_IMAGE)" \
	    -f deployer/Dockerfile \
	    .
	docker push "$(APP_DEPLOYER_IMAGE)"
	@touch "$@"


.build/codefresh/tester:
	$(call print_target, $@)
	docker pull cosmintitei/bash-curl
	docker tag cosmintitei/bash-curl "$(TESTER_IMAGE)"
	docker push "$(TESTER_IMAGE)"
	@touch "$@"

# Simulate building of primary app image. Actually just copying public image to
# local registry.
.build/codefresh/codefresh: .build/var/REGISTRY \
                            .build/var/TAG \
                            | .build/codefresh
	$(call print_target, $@)
	docker pull launcher.gcr.io/google/wordpress4-php5-apache
	docker tag launcher.gcr.io/google/wordpress4-php5-apache "$(REGISTRY)/example/codefresh:$(TAG)"
	docker push "$(REGISTRY)/example/codefresh:$(TAG)"
	@touch "$@"

# Build secondary app image.
.build/codefresh/init: init/* \
                       .build/var/REGISTRY \
                       .build/var/TAG \
                       | .build/codefresh
	$(call print_target, $@)
	cd init \
	&& docker build --tag "$(REGISTRY)/example/codefresh/init:$(TAG)" .
	docker push "$(REGISTRY)/example/codefresh/init:$(TAG)"
	@touch "$@"

# Relocate public mysql image to $REGISTRY.
.build/codefresh/mysql: .build/var/REGISTRY \
                        .build/var/TAG \
                        | .build/codefresh
	$(call print_target, $@)
	docker pull launcher.gcr.io/google/mysql5
	docker tag launcher.gcr.io/google/mysql5 "$(REGISTRY)/example/codefresh/mysql:$(TAG)"
	docker push "$(REGISTRY)/example/codefresh/mysql:$(TAG)"
	@touch "$@"

# Relocate ubbagent image to $REGISTRY.
.build/codefresh/ubbagent: .build/ubbagent/ubbagent \
                           .build/var/REGISTRY \
                           .build/var/TAG \
                           | .build/codefresh
	$(call print_target, $@)
	docker tag "gcr.io/cloud-marketplace-tools/ubbagent" "$(REGISTRY)/example/codefresh/ubbagent:$(TAG)"
	docker push "$(REGISTRY)/example/codefresh/ubbagent:$(TAG)"
	@touch "$@"
