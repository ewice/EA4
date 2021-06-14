import { Component, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { FormControl, FormGroup } from '@angular/forms';
// @ts-ignore
import * as data from '../../assets/tokenizer.json';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent implements OnInit {
  dictionary: any = (data as any).default;
  dictionaryLength = Object.keys(this.dictionary).length;
  predictForm = new FormGroup({
    input: new FormControl(''),
  });

  constructor() {}

  async ngOnInit(): Promise<void> {
    const model = await tf.loadLayersModel(
      'https://raw.githubusercontent.com/ewice/EA4/main/src/assets/model/model.json'
    );
    console.log('Model loaded');

    this.predictForm.get('input').valueChanges.subscribe(async (data) => {
      const words = this.cleanInput(data);
      let sequence = this.makeSequences(words);
      if (sequence.length > 0) {
        let tensor = tf.tensor(sequence);
        const predict = tf.tidy(() => model.predict(tensor) as tf.Tensor);
        const predictions = (await predict.dataSync()) as Float32Array;
        const descPredictions = [...predictions];
        descPredictions.sort((a: any, b: any) => b - a);
        const predictedWords = [];
        for (let i = 0; i < 5; i++) {
          let index = predictions.indexOf(descPredictions[i]);
          predictedWords.push(
            Object.keys(this.dictionary).find(
              (key) => this.dictionary[key] === index
            )
          );
        }
        console.log(predictedWords);
      }
    });
  }

  cleanInput(text: string): string[] {
    return text
      .replace(/[-|.|,|\?|\!]+/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/\d+/g, '')
      .toLowerCase()
      .split(' ');
  }

  makeSequences(words) {
    let sequence = [];
    let id = this.dictionary[words[words.length - 1]];
    if (id != undefined) {
      sequence.push(id);
    }
    return sequence;
  }
}
