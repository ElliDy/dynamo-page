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

	getTweetsWithHashtags(value) {
		let body = JSON.stringify({hashtags:value});
		let headers = new Headers({ 'Content-Type': 'application/json' });
    	let options = new RequestOptions({ headers: headers });
		return this.http.post('/tweets', body, options)
			.map(this.extractData);	
	}
	
	
}