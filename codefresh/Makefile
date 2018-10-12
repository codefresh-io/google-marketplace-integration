TAG ?= 1

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


APP_DEPLOYER_IMAGE ?= $(REGISTRY)/codefresh-marketplace/deployer:$(TAG)
NAME ?= codefresh-1
APP_PARAMETERS ?= { \
  "name": "$(NAME)", \
  "namespace": "$(NAMESPACE)", \
  "reportingSecret": "$(REPORTING_SECRET)", \
  "codefreshApiKey": "$(CF_API_KEY)", \
  "imageCodefresh": "$(REGISTRY)/codefresh-marketplace:$(TAG)", \
  "serviceAccount": "default" \
}

# Extend the target as defined in app.Makefile to
# include real dependencies.
app/build:: .build/codefresh/deployer

.build/codefresh: | .build
	mkdir -p "$@"

.build/codefresh/deployer: deployer/* \
                           chart/* \
                           schema.yaml \
                           .build/marketplace/deployer/envsubst \
                           .build/var/APP_DEPLOYER_IMAGE \
                           .build/var/REGISTRY \
                           .build/var/TAG \
                           | .build/codefresh
	$(call print_target, $@)
	docker build \
	    --build-arg REGISTRY="$(REGISTRY)" \
	    --build-arg TAG="$(TAG)" \
	    --tag "$(APP_DEPLOYER_IMAGE)" \
	    -f deployer/Dockerfile \
	    .
	docker push "$(APP_DEPLOYER_IMAGE)"
	@touch "$@"
