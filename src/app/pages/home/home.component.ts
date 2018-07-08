import { Component } from '@angular/core';
import { ActivatedRoute } from '../../../../node_modules/@angular/router';
import { HomepageContent } from '../../models/homepage-content';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private activatedRoute: ActivatedRoute) { }

  public get homepage(): HomepageContent {
    return this.activatedRoute.snapshot.data.homepage;
  }
}
