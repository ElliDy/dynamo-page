import {Injectable} from 'angular2/core'
import {DynamoIdea} from './dynamo-idea';

@Injectable()
export class DynamoIdeaService{
	public dynamoIdeas = [];

	saveIdea(idea: DynamoIdea){
		this.dynamoIdeas.push(idea);
		console.log(this.dynamoIdeas);
	}
	
}