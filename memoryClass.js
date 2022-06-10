export class Memory {
  static allMemories = [];

  constructor(title, cityName, imageURL, text, memoryEl, marker) {
    this.title = title;
    this.cityName = cityName;
    this.imageURL = imageURL;
    this.text = text;
    this.memoryEl = memoryEl;
    this.marker = marker;
  }
}
