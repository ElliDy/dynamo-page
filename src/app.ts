import {bootstrap,} from 'angular2/platform/browser';
import {PLATFORM_DIRECTIVES} from 'angular2/core';
import {HTTP_PROVIDERS} from 'angular2/http';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {DynamoIdeaBox} from './app/components/dynamo-idea-box/dynamo-idea-box';
import {DynamoPage} from './app/dynamo-page';

bootstrap(DynamoPage, [HTTP_PROVIDERS, ROUTER_PROVIDERS])
  .catch(err => console.error(err));