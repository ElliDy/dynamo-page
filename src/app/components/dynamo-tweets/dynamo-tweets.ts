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
  showImageOverlay: boolean;
  currentTweetImage: string;
  currentTweetImageIndex;

	constructor(private dynamoTweetsService:DynamoTweetsService) {
    this.showImageOverlay = false;
    this.currentTweetImage = "";
    this.currentTweetImageIndex = 0;
		this.dynamoTweetsService.getTweets().subscribe(
                   data  => this.tweetImages = data,
                   error =>  console.log(error),
                   () => console.log("Finished."));
	}

  getTweetsWithHashtags(value){
    this.dynamoTweetsService.getTweetsWithHashtags(value).subscribe(
                   data  => this.tweetImages = data,
                   error =>  console.log(error),
                   () => console.log("Finished."));
  }

  showTweetImageOverlay(image) {
    this.currentTweetImage = image;
    this.currentTweetImageIndex = this.tweetImages.indexOf(this.currentTweetImage);
    this.showImageOverlay = true;
  }

  closeOverlayImage(){
    this.showImageOverlay = false;
  }

  nextOverlayImage(){
    this.currentTweetImageIndex++;
    if(this.currentTweetImageIndex>this.tweetImages.length-1){
      this.currentTweetImageIndex = 0;
    }
    this.currentTweetImage = this.tweetImages[this.currentTweetImageIndex];
  }

  previousOverlayImage(){
    this.currentTweetImageIndex--;
    if(this.currentTweetImageIndex<0){
      this.currentTweetImageIndex = this.tweetImages.length-1;
    }
    this.currentTweetImage = this.tweetImages[this.currentTweetImageIndex];
  }

}
