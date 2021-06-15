import { Component, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { FormControl, FormGroup } from '@angular/forms';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
// @ts-ignore
import * as data from '../../assets/tokenizer.json';

@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.sass'],
})
export class PredictionComponent implements OnInit {
  faArrowDown = faArrowDown;
  dictionary: any = (data as any).default;
  dictionaryLength = Object.keys(this.dictionary).length;
  predictForm = new FormGroup({
    input: new FormControl(''),
  });

  constructor() {}

  async ngOnInit(): Promise<void> {
    const model = await tf.loadLayersModel(
      'https://raw.githubusercontent.com/ewice/EA4_Model/main/model.json'
    );
    console.log('Model loaded');

    this.predictForm.get('input').valueChanges.subscribe(async (text) => {
      const words = this.cleanInput(text);
      const sequence = this.makeSequences(words);
      if (sequence.length > 0) {
        const tensor = tf.tensor(sequence);
        const predict = tf.tidy(() => model.predict(tensor) as tf.Tensor);
        const predictions = (await predict.dataSync()) as Float32Array;
        const descPredictions = [...predictions];
        descPredictions.sort((a: any, b: any) => b - a);
        const predictedWords = [];
        for (let i = 0; i < 5; i++) {
          const index = predictions.indexOf(descPredictions[i]);
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

  makeSequences(words): number[] {
    const sequence = [];
    const id = this.dictionary[words[words.length - 1]];
    if (id !== undefined) {
      sequence.push(id);
    }
    return sequence;
  }
}
