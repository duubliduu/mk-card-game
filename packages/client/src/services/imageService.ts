import { fromImage } from "imtool";
import { ImTool } from "imtool/lib/ImTool";

class ImageService {
  images: Record<string, ImTool> = {};
  loaded: number = 0;

  get progress() {
    return Math.round((this.loaded / Object.keys(this.images).length) * 100);
  }

  async loadImages(images: string[] = []) {
    for (const image of images) {
      fromImage(`/images/cards/${image}`).then((imTool) => {
        this.images[image] = imTool;
        this.loaded++;
      });
    }
  }

  findImage(
    image: string,
    manipulate: (a: ImTool) => ImTool = (a: ImTool) => a
  ): Promise<HTMLImageElement> {
    if (!this.images[image]) throw new Error(`Image ${image} not found`);

    return manipulate(this.images[image]).type("image/png").toImage();
  }
}

export default new ImageService();
