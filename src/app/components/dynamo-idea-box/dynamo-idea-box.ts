import {Component} from 'angular2/core';
import {Http} from 'angular2/http';
import {DynamoIdea} from './dynamo-idea';
import {DynamoIdeaService} from './dynamo-idea.service';
import {OnInit} from 'angular2/core';

@Component({
  selector: 'dynamo-idea-box',
  templateUrl: 'app/components/dynamo-idea-box/dynamo-idea-box.html',
  styleUrls: ['app/components/dynamo-idea-box/dynamo-idea-box.css'],
  providers: [DynamoIdeaService],
  directives: [],
  pipes: []
})
export class DynamoIdeaBox implements OnInit{
	newIdea: DynamoIdea;

  	constructor(private _dynamoIdeaService : DynamoIdeaService) {
  	}

 	onSubmitIdea(){
 		this._dynamoIdeaService.saveIdea(this.newIdea);
 	}

 	ngOnInit(){
 		this.newIdea = {author:"",text:""};
 	}
}