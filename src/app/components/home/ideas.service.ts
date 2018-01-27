import {Injectable} from 'angular2/core';
import { Http, Headers, RequestOptions, Response } from 'angular2/http';

@Injectable()
export class DynamoIdeasService{

	constructor (private http: Http) {}

	private extractData(res: Response) {
		console.log(res);
	  let body = res.json();
	  return body.data || { };
	}
	getIdeas() {
		return this.http.get('http://localhost:1616/ideas')
			.map(this.extractData);	
	}

	increaseLikesOfIdea(id) {
		let body = JSON.stringify({like:id});
		let headers = new Headers({ 'Content-Type': 'application/json' });
    	let options = new RequestOptions({ headers: headers });
		return this.http.post('http://localhost:1616/ideas', body, options)
			.map(this.extractData);	
	}
	
	
}