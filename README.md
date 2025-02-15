# Vernissage Web

![Build Status](https://github.com/VernissageApp/VernissageWeb/actions/workflows/build.yml/badge.svg)
[![Typescript](https://img.shields.io/badge/Typescript-orange.svg?style=flat)](https://www.typescriptlang.org)
[![Angular](https://img.shields.io/badge/Angular-18-blue.svg?style=flat)](https://angular.io)
[![Platforms macOS | Linux | Windows](https://img.shields.io/badge/Platforms-macOS%20%7C%20Linux%20%7C%20Windows%20-lightgray.svg?style=flat)](https://angular.io)

Application which is Web component for Vernissage photos sharing platform.

<img src="images/01.png" width="400" > <img src="images/02.png" width="400" >

## Prerequisites

Before you start Web client you have to run Vernissage API. Here [https://github.com/VernissageApp/VernissageServer](https://github.com/VernissageApp/VernissageServer) you can find instructions how to do it on local development environment.

## Architecture

```
               +-----------------------------+
               |   VernissageWeb (Angular)   |
               +-------------+---------------+
                             |
                             |
               +-----------------------------+
               |   VernissageAPI (Swift)     |
               +-------------+---------------+
                             |
         +-------------------+-------------------+
         |                   |                   |
+--------+--------+   +------+------+   +--------+-----------+
|   PostgreSQL    |   |    Redis    |   |  ObjectStorage S3  |
+-----------------+   +-------------+   +--------------------+
```

## Getting started

After cloning the repository you can easily run the Web client. Go to main repository folder and run the command:

```bash
$ ng serve
```

Navigate to [http://localhost:4200/](http://localhost:4200/). The application will automatically reload if you change any of the source files.

## Docker

In production environments, it is best to use a [docker image](https://hub.docker.com/repository/docker/mczachurski/vernissage-web).

## Enable security headers

It is recommended to include secure headers in responses on production environments. This can be achieved by setting the system variable: `VERNISSAGE_CSP_IMG`. For example:

```bash
export VERNISSAGE_CSP_IMG=https://s3.eu-central-1.amazonaws.com
```

The value of the variable should point to the server address from which images served in the application are to be retrieved. This address will be added to the `Content-Security-Policy` header.