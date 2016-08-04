import {Component} from 'angular2/core';
import {Http} from 'angular2/http';
import {DynamoTweetsService} from './dynamo-tweets.service'

@Component({
  selector: 'dynamo-tweets',
  templateUrl: 'app/components/dynamo-tweets/dynamo-tweets.html',
  styleUrls: ['app/components/dynamo-tweets/dynamo-tweets.css'],
  providers: [DynamoTweetsService],
  directives: [],
  pipes: []
})
export class DynamoTweets {

	tweetImages: string[];

  	constructor(private dynamoTweetsService:DynamoTweetsService) {
  		this.dynamoTweetsService.getTweets().subscribe(
                     data  => this.tweetImages = data,
                     error =>  console.log(error),
                     () => console.log("Finished."));
  	}

}
