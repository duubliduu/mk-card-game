import { fromImage } from "imtool";
import { ImTool } from "imtool/lib/ImTool";

class ImageService {
  images: Record<string, ImTool> = {};
  loaded: number = 0;
  async loadImages(images: string[] = []) {
    for (const image of images) {
      fromImage(`/images/cards/${image}`).then((imTool: ImTool) => {
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

const imageService = new ImageService();

export default imageService;
