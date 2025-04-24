export AWS_ACCESS_KEY_ID ?= test
export AWS_SECRET_ACCESS_KEY ?= test
export AWS_DEFAULT_REGION=us-east-1
SHELL := /bin/bash

## Show this help
usage:
		@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

## Check if all required prerequisites are installed
check:
	@command -v docker > /dev/null 2>&1 || { echo "Docker is not installed. Please install Docker and try again."; exit 1; }
	@command -v node > /dev/null 2>&1 || { echo "Node.js is not installed. Please install Node.js and try again."; exit 1; }
	@command -v aws > /dev/null 2>&1 || { echo "AWS CLI is not installed. Please install AWS CLI and try again."; exit 1; }
	@command -v localstack > /dev/null 2>&1 || { echo "LocalStack is not installed. Please install LocalStack and try again."; exit 1; }
	@command -v cdk > /dev/null 2>&1 || { echo "CDK is not installed. Please install CDK and try again."; exit 1; }
	@command -v cdklocal > /dev/null 2>&1 || { echo "cdklocal is not installed. Please install cdklocal and try again."; exit 1; }
	@command -v aws > /dev/null 2>&1 || { echo "AWS CLI is not installed. Please install AWS CLI and try again."; exit 1; }
	@command -v awslocal > /dev/null 2>&1 || { echo "awslocal is not installed. Please install awslocal and try again."; exit 1; }
	@echo "All required prerequisites are available."

## Install dependencies
install:
		@if [ ! -d "node_modules" ]; then \
			echo "node_modules not found. Running npm install..."; \
			npm install; \
		fi
		@if [ ! -d "demos/rds-query-fn-code/node_modules" ]; then \
			echo "demos/rds-query-fn-code/node_modules not found. Running npm install..."; \
			npm install --prefix demos/rds-query-fn-code; \
		fi
		@echo "All required dependencies are available."

## Deploy the infrastructure
deploy:
		@echo "Bootstrapping CDK..."
		cdklocal bootstrap
		@echo "Deploying CDK..."
		cdklocal deploy --require-approval never
		@echo "CDK deployed successfully."

## Run the tests
test:
		@echo "Running tests..."
		npm test
		@echo "Tests completed successfully."

## Start LocalStack in detached mode
start:
		@echo "Starting LocalStack..."
		@LOCALSTACK_AUTH_TOKEN=$(LOCALSTACK_AUTH_TOKEN) localstack start -d
		@echo "LocalStack started successfully."

## Stop the Running LocalStack container
stop:
		@echo "Stopping LocalStack..."
		@localstack stop
		@echo "LocalStack stopped successfully."

## Make sure the LocalStack container is up
ready:
		@echo Waiting on the LocalStack container...
		@localstack wait -t 30 && echo LocalStack is ready to use! || (echo Gave up waiting on LocalStack, exiting. && exit 1)

## Save the logs in a separate file
logs:
		@localstack logs > logs.txt

.PHONY: usage check start ready install deploy test logs stop
