import {bootstrap} from 'angular2/platform/browser';
import {HTTP_PROVIDERS} from 'angular2/http';
import {ROUTER_PROVIDERS} from 'angular2/router';

import {DynamoPage} from './app/dynamo-page';

bootstrap(DynamoPage, [HTTP_PROVIDERS, ROUTER_PROVIDERS])
  .catch(err => console.error(err));