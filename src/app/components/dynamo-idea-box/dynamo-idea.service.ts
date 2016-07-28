import {Injectable} from 'angular2/core';
import {DynamoIdea} from './dynamo-idea';
import { Http, Headers, RequestOptions, Response } from 'angular2/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DynamoIdeaService{
	public dynamoIdeas = [];

	constructor (private http: Http) {}

	private extractData(res: Response) {
	  let body = res.json();
	  return body.data || { };
	}

	private handleError (error: any) {
	  // In a real world app, we might use a remote logging infrastructure
	  // We'd also dig deeper into the error to get a better message
	  let errMsg = (error.message) ? error.message :
	    error.status ? `${error.status} - ${error.statusText}` : 'Server error';
	  console.error(errMsg); // log to console instead
	  return Observable.throw(errMsg);
	}

	saveIdea(idea: DynamoIdea){
		let body = JSON.stringify(idea);
    	let headers = new Headers({ 'Content-Type': 'application/json' });
    	let options = new RequestOptions({ headers: headers });
		return this.http.post('/idea', body, options)
					.map(this.extractData);
	}
	
}