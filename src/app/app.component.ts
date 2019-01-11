import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";

interface Post {
  titie: string,
  id: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'i-proving-upgrade';
  posts$: Observable<Post[]>;

  constructor(private http:HttpClient) {}

  ngOnInit() {
    console.log('GETTING POSTS');
    this.posts$ = this.http.get<Post[]>("/posts");
  }
}