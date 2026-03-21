import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import helmet from 'helmet';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import AppServerModule from './src/main.server';
import { REQUEST, RESPONSE } from 'express.tokens';

const DEFAULT_ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '::1',
    'vernissage.photos',
    '*.vernissage.photos'
];

function parseAllowedHosts(value: string | undefined): string[] {
    if (!value) {
        return [];
    }

    return value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
}

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
    const server = express();

    const cspImg = process.env['VERNISSAGE_CSP_IMG'] || undefined;
    if (cspImg) {
        server.use(
            helmet({
                contentSecurityPolicy: {
                    useDefaults: false,
                    directives: {
                        baseUri: ["'self'"],
                        defaultSrc: ["'none'"],
                        connectSrc: ["'self'", "https://fonts.gstatic.com", cspImg],
                        formAction: ["'self'"],
                        objectSrc: ["'none'"],
                        frameAncestors: ["'none'"],
                        fontSrc: ["'self'", "https://fonts.gstatic.com"],
                        imgSrc: ["'self'","data:", "blob:", cspImg],
                        scriptSrc: ["'self'", "'unsafe-inline'"],
                        scriptSrcAttr: ["'self'", "'unsafe-inline'"],
                        styleSrc: ["'self'", "'unsafe-inline'"],
                        manifestSrc: ["'self'"],
                        blockAllMixedContent: [],
                        upgradeInsecureRequests: [],
                    },
                },
                referrerPolicy: {
                    policy: "same-origin",
                },
                xContentTypeOptions: false,
                strictTransportSecurity: {
                    maxAge: 31557600,
                },
                xFrameOptions: { action: "deny" }
            }),
        );
    }

    const serverDistFolder = dirname(fileURLToPath(import.meta.url));
    const browserDistFolder = resolve(serverDistFolder, '../browser');
    const indexHtml = join(serverDistFolder, 'index.server.html');

    const configuredAllowedHosts = parseAllowedHosts(
        process.env['VERNISSAGE_ALLOWED_HOSTS'] || process.env['NG_ALLOWED_HOSTS'],
    );
    const commonEngine = new CommonEngine({
        allowedHosts: configuredAllowedHosts.length > 0 ? configuredAllowedHosts : DEFAULT_ALLOWED_HOSTS,
    });

    server.set('view engine', 'html');
    server.set('views', browserDistFolder);

    // Example Express Rest API endpoints
    // server.get('/api/**', (req, res) => { });
    // Serve static files from /browser
    server.get('**', express.static(browserDistFolder, {
        maxAge: '1y',
        index: 'index.html',
    }));

    // All regular routes use the Angular engine
    server.get('**', (req, res, next) => {
        const { protocol, originalUrl, baseUrl, headers } = req;

        commonEngine
            .render({
                bootstrap: AppServerModule,
                documentFilePath: indexHtml,
                url: `${protocol}://${headers.host}${originalUrl}`,
                publicPath: browserDistFolder,
                providers: [
                    { provide: APP_BASE_HREF, useValue: baseUrl },
                    { provide: REQUEST, useValue: req },
                    { provide: RESPONSE, useValue: res }
                ],
            })
            .then((html) => {
                res.set('Cache-Control', 'private, no-store, max-age=0');
                return res.send(html)
            })
            .catch((err) => next(err));
      });

      return server;
  }

function run(): void {
    const port = process.env['PORT'] || 8080;

    // Start up the Node server
    const server = app();
    server.listen(port, () => {
        console.log(`Node Express server listening on http://localhost:${port}`);
    });
}

run();  
