# StatsD

[Dockerhub](https://hub.docker.com/r/dblworks/statsd)

## Building

On a x86 chip

```shell
docker build -t dblworks/statsd:$TAGNAME .
```

On a ARM chip (for a x86 target):

```shell
docker build -t dblworks/statsd:$TAGNAME . --platform amd64
```

## Publishing

```shell
docker push dblworks/statsd:$TAGNAME
```

## Running

```shell
docker run dblworks/statsd:$TAGNAME
```

## Deployment

### Using AWS ECR as container registry

```shell
docker build -t localhost/statsd .

git fetch --all --tags
LATEST_RELEASE="$(git describe --abbrev=0 --tags)"
AWS_REGION=eu-central-1
AWS_PROFILE=
AWS_ACCOUNT_ID=

aws ecr get-login-password --profile $AWS_PROFILE --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
docker tag localhost/statsd $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/statsd:$LATEST_RELEASE
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/statsd:$LATEST_RELEASE
```

### Push to Dockerhjub

```shell
docker build -t localhost/statsd .

git fetch --all --tags
LATEST_RELEASE="$(git describe --abbrev=0 --tags)"

docker login
docker tag localhost/statsd dblworks/statsd:$LATEST_RELEASE
docker push dblworks/statsd:$LATEST_RELEASE
```

## Further Reads

statsd official docs: https://github.com/statsd/statsd
