import imageService from "./imageService";

describe("ImageService", () => {
  it("should load images", () => {
    const images = ["image1", "image2", "image3"];
    imageService.loadImages(images);
    expect(imageService.findImage("image1")).toEqual(
      expect.any(HTMLImageElement)
    );
  });
});
