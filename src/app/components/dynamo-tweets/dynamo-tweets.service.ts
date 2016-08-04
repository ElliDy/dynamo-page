import {Injectable} from 'angular2/core';
import { Http, Headers, RequestOptions, Response } from 'angular2/http';

@Injectable()
export class DynamoTweetsService{

	constructor (private http: Http) {}

	private extractData(res: Response) {
	  let body = res.json();
	  return body.data || { };
	}
	getTweets() {
		return this.http.get('/tweets')
			.map(this.extractData);	
	}
	
	
}