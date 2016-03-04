import {Component} from 'angular2/core';
import {Http} from 'angular2/http';


@Component({
  selector: 'dynamo-links',
  templateUrl: 'app/components/dynamo-links/dynamo-links.html',
  styleUrls: ['app/components/dynamo-links/dynamo-links.css'],
  providers: [],
  directives: [],
  pipes: []
})
export class DynamoLinks {

  constructor(http:Http) {

  }
}
