import {Component} from 'angular2/core';
import {Http} from 'angular2/http';


@Component({
  selector: 'dynamo-pictures',
  templateUrl: 'app/components/dynamo-pictures/dynamo-pictures.html',
  styleUrls: ['app/components/dynamo-pictures/dynamo-pictures.css'],
  providers: [],
  directives: [],
  pipes: []
})
export class DynamoPictures {
  constructor(http:Http) {

  }
}
