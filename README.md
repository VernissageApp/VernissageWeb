# Vernissage Web

![Build Status](https://github.com/VernissageApp/VernissageWeb/actions/workflows/build.yml/badge.svg)
[![Typescript](https://img.shields.io/badge/Typescript-orange.svg?style=flat)](https://www.typescriptlang.org)
[![Angular](https://img.shields.io/badge/Angular-17-blue.svg?style=flat)](https://angular.io)
[![Platforms macOS | Linux | Windows](https://img.shields.io/badge/Platforms-macOS%20%7C%20Linux%20%7C%20Windows%20-lightgray.svg?style=flat)](https://angular.io)

Application which is Web component for Vernissage photos sharing platform.

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

After clonning the reposity you can easly run the Web client. Go to main repository folder and run the command:

```bash
$ ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Docker

In production environments, it is best to use a [docker image](https://hub.docker.com/repository/docker/mczachurski/vernissage-web).