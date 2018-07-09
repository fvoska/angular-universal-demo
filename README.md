# Angular Universal Demo

## 1. Installing

Run `yarn` in project root to install all the dependencies.

## 2. Starting the demo

First, start the mock-data server with `npm run start:mock-data-server`. By default the server is running on port 4201, you can set custom port via `PORT` environment variable (`PORT=6666 npm run start:mock-data-server`).

To build and run SSR version of the app, run `npm run start:ssr`. The app relies on `API_BASE` environment variable, so make sure it is exported.

```bash
# use mock-data api base url
export API_BASE="http://localhost:4201"

# test if it is exported correctly
echo $API_BASE

# build and run SSR version of the app
npm run start:ssr
```

## 3. Why universal

There are three main reasons to create a Universal version of your app:

1. Facilitate web crawlers (SEO)
2. Improve performance on mobile and low-powered devices
3. Show the first page quickly

[Official [Angular Universal guide](https://angular.io/guide/universal)]

## 4. SSR-related problems and solutions

### 4.1. Determine if the app is running in browser or in node

Available APIs are different depending on where the app is running. If the app is running in browser, you will have access to things like `window`, and if the app is running in node `window` will be undefined but you will have access to `Request`, `Response`, `global`, environment variables and some other useful things like `fs`.

In order to avoid exceptions because of API unavailability on certain platform, we can safe-guard execution of platform-specific code:

```ts
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
//...
@Component({
  //...
})
export class MyComponent {
  constructor(@Inject(PLATFORM_ID) private platformId: object) { }

  private get isPlatformBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private get isPlatformServer(): boolean {
    return isPlatformServer(this.platformId);
  }
}
```

### 4.2. Handle rendering of secured routes which require login

Some routes might be accessible only if the user is logged in. This means that, when rendering, the server has to know if the user is logged in. This automatically rules out storing of session info in `localStorage` and only option is to use cookies for storing login token or whatever info is necessary to determine user auth status. Cookies are the only options because they are sent by the browser when making the initial call for index page.

The process can be described as follows:

1. User visits `myapp.com` for the first time
2. User logs in, JS saves token in a cookie
3. User closes the browser.

----

1. User opens the browser and enters `myapp.com/user-profile` in address bar
2. Browser makes a `GET` request for `http://myapp.com/user-profile` and sends cookie in request header:
    - **Cookie:** token=ey...
3. Node server reads cookie from the request and makes an authorization check call to the API
    - if the token from cookie is valid, authorize the user in app
4. Auth route guard allows navigation to `user-profile` since the user is authorized
5. Node server renders `user-profile` route
6. Server returns rendered `HTML`

### 4.3. Setting correct response code

If user navigates to a non-existent route, it is expected that a `404` status code is returned. However, out of the box this does not happen.

What happens is:

1. User navigates to `myapp.com/{slug}`
2. Server makes call to the API to fetch data for page via `slug`.
3. API returns 404
4. Server renders component with title `Page not found`
3. Rendered HTML is returned with status `200`

Additional step is required somewhere between steps 3 and 5:

1. User navigates to `myapp.com/{slug}`
2. Server makes call to the API to fetch data for page via `slug`.
3. API returns 404
4. Catch page fetching errors and set `express` `Response` status.
5. Server renders component with title `Page not found`
6. Rendered HTML is returned with status `404`

Same method can be used to return status `401` if user tries navigating to `myapp.com/user-profile` when not logged in.

Page fetching service:
```ts
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { Response } from 'express';
//...
@Injectable()
export class PageFetchingService {
  constructor(
    private http: HttpClient,
    private platform: PlatformService,
    @Optional() @Inject(RESPONSE) private response: Response,
  ) { }

  public fetchPage(slug: string): Observable<Page> {
    this.http
        .get(`api.com/page?slug=${slug}`)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            if (this.platform.isServer) {
              this.response.status(error.code);
            }
          }),
          map((pageData: IPage) => {
            return new Page(pageData);
          }),
        );
  }
}
```

`server.ts`:
```ts
//...
import { ngExpressEngine, RenderOptions } from '@nguniversal/express-engine';
import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

app.engine('html', (
  filePath: string,
  options: RenderOptions,
  callback: Function,
) => ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP),
    {
      provide: REQUEST,
      useValue: options.req,
    },
    {
      provide: RESPONSE,
      useValue: options.req.res,
    },
  ],
})(filePath, options, callback));
//...
```

### 4.4. State transfer

There is a mechanism for transfering data from server to client, via `TransferState` service.

If server sets some data for transfer, it is returned to the browser via `<script>` tag. For example:

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <!-- ... -->
</head>

<body>
  <!-- ... rendered page ... -->

<script id="universal-demo-state" type="application/json">
    { &q;homepageData&q;:{&q;title&q;:&q;Welcome&q;,&q;text&q;:&q;Angular
          Universal Demo & q;,
        & q;time & q;: 1531076035630
      }
    }
  </script>
</body>

</html>
```

This mechanism can be used for multiple things, as described in chapters [4.5](#4.5.-Avoid-unnecessary-duplication-of-requests) and [4.6](#4.6.-Reading-environment-variables-at-run-time).

### 4.5. Avoid unnecessary duplication of requests

In order to render some pages, app probably has to fetch data from API. This call will be made on the server as well in the browser once the app bootstraps. To avoid unnecessary duplicate calls for same data on both platforms, we can make the call only on server and transfer the data to browser.

```ts
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Observable, of as observableOf } from 'rxjs';
import { map, tap } from 'rxjs/operators';
//...

@Injectable()
export class HomepageService {
  private readonly hompeageStateKey = makeStateKey<IHomepageContent>('homepageData');

  constructor(
    private http: HttpClient,
    private platform: PlatformService,
    private transferState: TransferState,
  ) { }

  public getHomepage(): Observable<HomepageContent> {
    // Check if data is transferred
    if (this.platform.isBrowser && this.transferState.hasKey(this.hompeageStateKey)) {
      const transferedHomepageData: IHomepageContent = this.transferState.get(this.hompeageStateKey, null);

      // Clear from store to avoid 'caching'
      this.transferState.remove(this.hompeageStateKey);

      const homepage = new HomepageContent(transferedHomepageData);

      return observableOf(homepage);
    }

    // If no data was transferred or the data was cleared, make the call
    return this.http.get(`${this.apiBase}/homepage`).pipe(
      tap((homepageData: IHomepageContent) => {
        if (this.platform.isServer) {
          this.transferState.set(this.hompeageStateKey, homepageData);
        }
      }),
      map((homepageData: IHomepageContent) => {
        return new HomepageContent(homepageData);
      }),
    );
  }
}
```

### 4.6. Reading environment variables at run-time

There are two options for handling environment variables:
1. Inject values at build-time (via `webpack` or some other method)
2. Read them at run-time on the server and transfer them to the browser

Second option might be required in some cases. For example, if the app is build once and then a Docker image is created with that build. That Docker image might be placed in multiple environments. If first option is employed, app will have to be rebuilt whenever Docker image is placed in a different environment. This might required re-distribution of the image (annoying and not streamlined). Also note that second option is possible only with SSR. App without SSR will have to use injected values from build-time (deal with it).

Environment variables service might look something like this:
```ts
@Injectable()
export class EnvironmentVariablesService {
  private readonly transferKey = makeStateKey('envVars');
  private vars: IDictionary<string> = {};

  constructor(
    private platform: PlatformService,
    private transferState: TransferState,
  ) {
    if (this.platform.isServer) {
      exposedEnvironmentVariables.forEach((envVarName) => {
        this.vars[envVarName] = process.env[envVarName];
      });

      this.transferState.set(this.transferKey, this.vars);
    }

    if (this.platform.isBrowser) {
      this.vars = this.transferState.get(this.transferKey, {});
    }
  }

  public getVar(name: ExposedEnvironmentVariable): string {
    if (name in this.vars) {
      return this.vars[name];
    }

    const defaultValue = defaultEnvironmentVariablesValues[name];
    return defaultValue;
  }
}
```

## 5. Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## 6. Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## 7. Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## 8. Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## 9. Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## 10. Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
