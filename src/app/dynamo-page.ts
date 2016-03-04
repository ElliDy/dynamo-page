import {Component} from 'angular2/core';
import {Router, Route, RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';

import {Home} from './components/home/home';
import {About} from './components/about/about';
import {RepoBrowser} from './components/repo-browser/repo-browser';
import {DynamoLinks} from './components/dynamo-links/dynamo-links';

@Component({
  selector: 'dynamo-page',
  providers: [],
  templateUrl: 'app/dynamo-page.html',
  styleUrls: ['app/dynamo-page.css'],
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
@RouteConfig([
  new Route({ path: '/home', component: Home, name: 'Home', useAsDefault: true}),
  new Route({ path: '/about', component: About, name: 'About'}),
  new Route({ path: '/github/...', component: RepoBrowser, name: 'RepoBrowser'}),
  new Route({ path: '/dynamo-links', component: DynamoLinks, name: 'DynamoLinks'})
])
export class DynamoPage {

  constructor() {}

}
