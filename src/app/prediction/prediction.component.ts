import { Component, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
    predict: new FormControl('', Validators.required),
    number: new FormControl(5, [Validators.required, Validators.min(0)]),
  });
  predictedWords: string[];
  isModelLoading = true;
  numberOfPrediction = 5;

  constructor() {}

  async ngOnInit(): Promise<void> {
    const model = await tf.loadLayersModel(
      'https://raw.githubusercontent.com/ewice/EA4_Model/main/model.json'
    );
    this.isModelLoading = false;

    this.predictForm.get('number').valueChanges.subscribe((number) => {
      this.numberOfPrediction = number;
    });

    this.predictForm.get('predict').valueChanges.subscribe(async (text) => {
      this.predictedWords = [];
      const words = this.cleanInput(text);
      const sequence = this.makeSequences(words);
      if (sequence.length > 0) {
        const tensor = tf.tensor2d(sequence, [1, 5]);
        const predict = tf.tidy(() => model.predict(tensor) as tf.Tensor);
        const predictions = (await predict.dataSync()) as Float32Array;
        const descPredictions = [...predictions];
        descPredictions.sort((a: any, b: any) => b - a);
        for (let i = 0; i < this.numberOfPrediction; i++) {
          const index = predictions.indexOf(descPredictions[i]);
          this.predictedWords.push(
            Object.keys(this.dictionary).find(
              (key) => this.dictionary[key] === index
            )
          );
        }
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
    words.forEach((word) => {
      const id = this.dictionary[word];
      if (id !== undefined) {
        sequence.push(id);
      } else {
        sequence.push(null);
      }
    });
    while (sequence.length < 5) {
      sequence.push(null);
    }
    return sequence.slice(Math.max(sequence.length - 5, 0));
  }

  onAddSelectedWordToInputClick(word: string): void {
    const currentInput = this.predictForm.get('predict').value;
    this.predictForm.get('predict').setValue(currentInput + ' ' + word);
  }
}
