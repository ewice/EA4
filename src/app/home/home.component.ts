import { Component, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent implements OnInit {
  predictForm = new FormGroup({
    input: new FormControl(''),
  });

  constructor() {}

  async ngOnInit(): Promise<void> {
    const model = await tf.loadLayersModel('http://127.0.0.1:8080/model.json');
    console.log(model.summary());
    this.predictForm.get('input').valueChanges.subscribe((data) => {
      console.log(data);
    });
    // this.model.predict
    // temp.data
  }
}
