class ImageService {
  images: Record<string, HTMLImageElement> = {};
  loaded: number = 0;

  get progress() {
    return Math.round((this.loaded / Object.keys(this.images).length) * 100);
  }

  loadImages(images: string[] = []) {
    for (const image of images) {
      const instance = new Image();
      instance.src = `/images/cards/${image}`;
      instance.onload = () => {
        console.log(`${image} loaded`);
        this.loaded++;
      };
      this.images[image] = instance;
    }
  }

  findImage(image: string) {
    if (!this.images[image]) throw new Error(`Image ${image} not found`);

    return this.images[image];
  }
}

export default new ImageService();
