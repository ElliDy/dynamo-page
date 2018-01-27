import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {DynamoIdeasService} from './ideas.service'

@Component({
  selector: 'home',
  templateUrl: 'app/components/home/home.html',
  styleUrls: ['app/components/home/home.css'],
  providers: [DynamoIdeasService],
  directives: [ROUTER_DIRECTIVES],
  pipes: []
})
export class Home {

  	public fullTextShown;
    ideas;

  	constructor(private dynamoIdeasService:DynamoIdeasService) {
  		 this.fullTextShown = false;
       this.getIdeas();
  	}


	public toggleFullTextContainer = () => {  
	  this.fullTextShown = !this.fullTextShown;
	}

  getIdeas(){
    this.dynamoIdeasService.getIdeas().subscribe(
                   data  => this.ideas = data,
                   error =>  console.log(error),
                   () => console.log("Finished."));
  }

  likeIdea(id){
    console.log(id);
    this.dynamoIdeasService.increaseLikesOfIdea(id).subscribe(
                   data  => console.log("Like Done"),
                   error =>  console.log(error),
                   () => console.log("Finished."));
  }

}
