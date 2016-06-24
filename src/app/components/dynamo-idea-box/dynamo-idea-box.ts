import {Component} from 'angular2/core';
import {Http} from 'angular2/http';


@Component({
  selector: 'dynamo-idea-box',
  templateUrl: 'app/components/dynamo-idea-box/dynamo-idea-box.html',
  styleUrls: ['app/components/dynamo-idea-box/dynamo-idea-box.css'],
  providers: [],
  directives: [],
  pipes: []
})
export class DynamoIdeaBox {

  constructor(http:Http) {

  }
}