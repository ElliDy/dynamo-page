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

	tweets;
  showImageOverlay: boolean;
  currentTweet: string;
  currentTweetImageIndex;
  showTweetText: boolean;

	constructor(private dynamoTweetsService:DynamoTweetsService) {
    this.showImageOverlay = false;
    this.showTweetText = false;
    this.currentTweetImageIndex = 0;
		this.dynamoTweetsService.getTweets().subscribe(
                   data  => this.tweets = data,
                   error =>  console.log(error),
                   () => console.log("Finished."));
	}

  getTweetsWithHashtags(value){
    this.dynamoTweetsService.getTweetsWithHashtags(value).subscribe(
                   data  => this.tweets = data,
                   error =>  console.log(error),
                   () => console.log("Finished."));
  }

  showTweetImageOverlay(tweet) {
    this.currentTweet = tweet;
    this.currentTweetImageIndex = this.tweets.indexOf(this.currentTweet);
    console.log(this.currentTweetImageIndex);
    this.showImageOverlay = true;
  }

  closeOverlayImage(){
    this.showImageOverlay = false;
  }

  nextOverlayImage(){
    this.currentTweetImageIndex++;
    if(this.currentTweetImageIndex>this.tweets.length-1){
      this.currentTweetImageIndex = 0;
    }
    this.currentTweet = this.tweets[this.currentTweetImageIndex];
  }

  previousOverlayImage(){
    this.currentTweetImageIndex--;
    if(this.currentTweetImageIndex<0){
      this.currentTweetImageIndex = this.tweets.length-1;
    }
    this.currentTweet = this.tweets[this.currentTweetImageIndex];
  }

}
